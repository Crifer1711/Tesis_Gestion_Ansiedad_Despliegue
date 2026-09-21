import { NextResponse } from "next/server";
import { RegisterUserUseCase } from "@/application/use-cases/auth/register-user.use-case";
import { PgUserRepository } from "@/infrastructure/repositories/pg-user.repository";
import { sendVerificationEmail } from "@/infrastructure/external-services/email.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Inyectamos la dependencia (PostgreSQL)
    const repository = new PgUserRepository();
    const useCase = new RegisterUserUseCase(repository);

    const result = await useCase.execute(body);

    // Respondemos rápido al usuario y dejamos el envío de correo en segundo plano.
    void sendVerificationEmail(result.email, result.verificationToken)
      .then(() => {
        console.info('[Register] Verification email sent for:', result.email);
      })
      .catch((emailError) => {
        console.error('[Register] Verification email could not be sent:', emailError);
      });

    return NextResponse.json(
      { message: result.message },
      { status: 201 }
    );
  } catch (error: unknown) {
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: String(error) }, { status: 400 });
}
}