"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from "next/image";

interface Formulario {
  nome: string;
  cpf: string;
  classificacao: string;
  descricao: string;
  assinatura: string;
}

export default function VisualizarFormulario() {
  const { id } = useParams();
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/auto/${id}`);
      const data = await res.json();
      setFormulario(data);
    };

    fetchData();
  }, [id]);

  const gerarPDF = async () => {
    if (!formRef.current) return;

    const canvas = await html2canvas(formRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Se a imagem for maior que a página em altura, pode cortar
    // Você pode ajustar aqui para dividir em páginas, se quiser.

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`auto_infracao_${id}.pdf`);
  };

  if (!formulario) return <p>Carregando...</p>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Auto de Infração #{id}</h1>

      <div ref={formRef} className="bg-white shadow-md p-4 rounded mb-6">
        <p>
          <strong>Nome:</strong> {formulario.nome}
        </p>
        <p>
          <strong>CPF:</strong> {formulario.cpf}
        </p>
        <p>
          <strong>Classificação:</strong> {formulario.classificacao}
        </p>
        <p>
          <strong>Descrição:</strong> {formulario.descricao}
        </p>
        <div>
          <strong>Assinatura:</strong>
          <br />
          <Image
            src={formulario.assinatura}
            alt="Assinatura"
            width={200}
            height={100}
            priority={true}
          />
        </div>
      </div>

      <button
        onClick={gerarPDF}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Salvar como PDF
      </button>
    </div>
  );
}
