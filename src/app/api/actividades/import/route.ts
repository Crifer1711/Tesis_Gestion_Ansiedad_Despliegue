import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import db from '@/infrastructure/database/db';

export async function POST(request: Request) {
  try {
    console.log('[import] inicio POST import');
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Debes estar autenticado' }, { status: 401 });
    }

    // Solo administradores pueden importar
    if (session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    console.log('[import] content-type:', contentType);

    let zipBuffer: ArrayBuffer | null = null;
    let sourceType: 'zip' | 'url' = 'zip';
    let sourceUrl: string | null = null;
    let sourceFilename: string | null = null;
    let manifest: any = null;

    if (contentType.includes('multipart/form-data')) {
      // Parse form data
      const form = await request.formData();
      const file = form.get('file') as any;
      const url = form.get('url') as any;

      console.log('[import] formData keys:', Array.from((form as any).keys ? (form as any).keys() : []));

      if (file && typeof file.arrayBuffer === 'function') {
        zipBuffer = await file.arrayBuffer();
        sourceFilename = (file as File).name || null;
        sourceType = 'zip';
      } else if (url && typeof url === 'string' && url.trim() !== '') {
        sourceUrl = url.toString();
        sourceType = 'url';
      } else {
        return NextResponse.json({ error: 'No se proporcionó archivo ZIP ni URL' }, { status: 400 });
      }
    } else {
      // JSON body
      let body: any = {};
      try {
        body = await request.json();
      } catch (err) {
        console.log('[import] no JSON body');
      }
      if (body.url) {
        sourceUrl = String(body.url);
        sourceType = 'url';
      } else if (body.fileBase64) {
        // atob may not be available in some Node versions
        const b64 = body.fileBase64;
        const binary = Buffer.from(b64, 'base64');
        zipBuffer = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
        sourceType = 'zip';
      } else {
        return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
      }
    }

    // If URL provided, download
    if (sourceUrl) {
      console.log('[import] descargando URL:', sourceUrl);
      const resp = await fetch(sourceUrl);
      if (!resp.ok) {
        console.error('[import] error descargando URL, status:', resp.status);
        return NextResponse.json({ error: 'No se pudo descargar el ZIP desde la URL' }, { status: 400 });
      }
      // Check content type or filename to detect ZIP
      const ctype = resp.headers.get('content-type') || '';
      const urlLower = sourceUrl.toLowerCase();
      if (ctype.includes('zip') || urlLower.endsWith('.zip')) {
        zipBuffer = await resp.arrayBuffer();
      } else {
        // Treat as regular page: build minimal manifest from page title or url
        const text = await resp.text();
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const pageTitle = titleMatch ? titleMatch[1].trim() : sourceUrl;
        const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
        const generatedSlug = makeSlug(pageTitle || sourceUrl) || String(Date.now());

        // set manifest directly
        manifest = {
          tipo: 'actividad-bienestar',
          titulo: pageTitle,
          slug: generatedSlug,
          embed_url: sourceUrl,
          descripcion: '',
          indicaciones: [],
          finalizacion: {},
          eventos: {},
          persistencia_recomendada: {}
        };
      }
    }

    // If zipBuffer is present, parse ZIP and read manifest.json
    if (zipBuffer) {
      const jszip = new JSZip();
      let zip: any;
      try {
        zip = await jszip.loadAsync(zipBuffer);
      } catch (err) {
        console.error('[import] error parseando ZIP:', err);
        return NextResponse.json({ error: 'ZIP inválido o corrupto' }, { status: 400 });
      }

      const manifestFile = zip.file('manifest.json') || zip.file('./manifest.json');
      if (!manifestFile) {
        return NextResponse.json({ error: 'manifest.json no encontrado en el ZIP' }, { status: 400 });
      }

      const manifestText = await manifestFile.async('string');
      try {
        manifest = JSON.parse(manifestText);
      } catch (e) {
        console.error('[import] manifest parse error:', e);
        return NextResponse.json({ error: 'manifest.json inválido' }, { status: 400 });
      }
    }

    // Validar campos mínimos
    const required = ['tipo', 'titulo', 'slug', 'embed_url'];
    for (const r of required) {
      if (!manifest[r]) {
        return NextResponse.json({ error: `Campo requerido faltante en manifest: ${r}` }, { status: 400 });
      }
    }

    // Preparar campos
    const tipo = manifest.tipo;
    const titulo = manifest.titulo;
    const slug = manifest.slug;
    const embed_url = manifest.embed_url;
    // 'categoria' may be provided as 'categoria' or 'category' in manifests
    const categoria = manifest.categoria || manifest.category || null;
    const descripcion = manifest.descripcion || null;
    const indicaciones = manifest.indicaciones || [];
    const finalizacion = manifest.finalizacion || {};
    const eventos = manifest.eventos || {};
    const persistencia_recomendada = manifest.persistencia_recomendada || {};

    // Insertar en DB incluyendo columna `categoria` si está presente en el manifest
    const insertSQL = `
      INSERT INTO actividades
      (tipo, categoria, slug, titulo, descripcion, embed_url, indicaciones, finalizacion, eventos, persistencia_recomendada, manifest_original, estado)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
    `;

    const params = [
      tipo,
      categoria,
      slug,
      titulo,
      descripcion,
      embed_url,
      JSON.stringify(indicaciones),
      JSON.stringify(finalizacion),
      JSON.stringify(eventos),
      JSON.stringify(persistencia_recomendada),
      JSON.stringify(manifest),
      'pendiente'
    ];

    try {
      const result = await db.query(insertSQL, params);
      const newId = result.rows[0]?.id;
      console.log('[import] actividad insertada id=', newId);
      return NextResponse.json({ success: true, id: newId });
    } catch (err) {
      console.error('[import] error insertando en DB:', err);
      return NextResponse.json({ error: 'Error interno al insertar actividad: ' + (err?.message || String(err)) }, { status: 500 });
    }
  } catch (error) {
    console.error('Error importing actividad:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno al importar actividad: ' + msg }, { status: 500 });
  }
}
