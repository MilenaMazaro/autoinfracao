import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ResultSetHeader, FieldPacket } from "mysql2";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nome, cpf, descricao, classificacao, assinatura } = body;

    const query = `
      INSERT INTO auto_infracoes 
      (nome, cpf, descricao, classificacao, assinatura) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [nome, cpf, descricao, classificacao, assinatura];

    const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(query, values);

    const novoId = result.insertId;

    return NextResponse.json({
      success: true,
      message: "Dados salvos com sucesso!",
      id: novoId,
    });
  } catch (error) {
    console.error("Erro ao salvar no banco:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao salvar os dados" },
      { status: 500 }
    );
  }
}
