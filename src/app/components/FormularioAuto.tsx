"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function FormularioAuto() {
  const assinaturaRef = useRef<SignatureCanvas>(null);
  const agenteRef = useRef<SignatureCanvas>(null);

  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    descricao: "",
    classificacao: "",
    serie: "",
    id: "",
    assinatura: "",
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    manualEndereco: false,
  });

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");

    if (input.length > 11) input = input.slice(0, 11);

    let formatted = input;

    if (input.length > 0) {
      formatted = `(${input.slice(0, 2)}`;
    }
    if (input.length >= 3) {
      formatted += `) ${input.slice(2, 7)}`;
    }
    if (input.length >= 8) {
      formatted += `-${input.slice(7, 11)}`;
    }

    setFormData((prev) => ({ ...prev, telefone: formatted }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "cep" && value.length >= 8) {
      buscarEndereco(value);
    }
  };

  const handleChangeNumerico = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const numericValue = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, [name]: numericValue }));
  };

  const limparAssinatura = () => {
    assinaturaRef.current?.clear();
  };

  const limparAssinaturaAgente = () => {
    agenteRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const assinaturaBase64 = assinaturaRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    const payload = {
      ...formData,
      assinatura: assinaturaBase64,
    };

    try {
      const res = await fetch("/api/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao enviar formulário");

      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          id: data.id.toString(),
        }));

        router.push(`/visualizar/${data.id}`);

        alert("Formulário enviado com sucesso! ID gerado: " + data.id);
      } else {
        alert("Erro: " + data.message);
      }
    } catch (error) {
      alert("Erro ao enviar: " + error);
    }
  };

  const [testemunhas, setTestemunhas] = useState<
    { nome: string; cpf: string }[]
  >([]);

  const adicionarTestemunha = () => {
    setTestemunhas((prev) => [...prev, { nome: "", cpf: "" }]);
  };

  const removerTestemunha = (index: number) => {
    setTestemunhas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestemunhaChange = (
    index: number,
    field: "nome" | "cpf",
    value: string
  ) => {
    const novas = [...testemunhas];
    novas[index][field] = value;
    setTestemunhas(novas);
  };

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        setFormData((prev) => ({ ...prev, manualEndereco: true }));
      } else {
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          manualEndereco: false,
        }));
      }
    } catch (error) {
      setFormData((prev) => ({ ...prev, manualEndereco: true }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4"
    >
      <div className="flex items-center justify-center gap-4 mb-2">
        <Image
          src="/logo.png"
          alt="Logo da Prefeitura"
          width={64}
          height={64}
          className="h-20 w-auto"
        />
        <h1 className="text-black font-bold text-lg text-center underline">
          PREFEITURA MUNICIPAL DA ESTÂNCIA DE CAMPOS DO JORDÃO
        </h1>
      </div>

      <h2 className="text-xl font-bold text-black text-center">
        Auto de Infração Ambiental
      </h2>

      <div className="flex gap-4">
        <div className="w-1/3">
          <label className="block font-medium text-black">Data</label>
          <input
            type="date"
            name="data"
            onChange={handleChange}
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>

        <div className="w-1/3">
          <label className="block font-medium text-black">Série</label>
          <select
            name="serie"
            onChange={handleChange}
            required
            className="w-full bg-gray-100 border border-gray-400 rounded px-3 py-2 text-black"
          >
            <option value="">Selecione uma opção</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <div className="w-1/3">
          <label className="block font-medium text-black">ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            readOnly
            className="w-full bg-gray-100 border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-black">
          Nome do Notificado
        </label>
        <input
          type="text"
          name="nome"
          onChange={handleChange}
          required
          className="w-full border border-gray-400 rounded px-3 py-2 text-black"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block font-medium text-black">
            Documento (RG/CPF)
          </label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChangeNumerico}
            inputMode="numeric"
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>

        <div className="w-1/2">
          <label className="block font-medium text-black">Telefone</label>
          <input
            type="text"
            name="telefone"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            inputMode="numeric"
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-black font-medium">CEP</label>
        <input
          type="text"
          name="cep"
          value={formData.cep}
          onChange={handleChange}
          className="w-full border border-gray-400 rounded px-3 py-2 text-black"
        />
      </div>

      {/* Campos automáticos */}
      {!formData.manualEndereco && formData.logradouro && (
        <div className="mt-4">
          <label className="block text-black font-medium">Endereço</label>
          <input
            type="text"
            value={`${formData.logradouro}, ${formData.bairro}, ${formData.cidade} - ${formData.estado}`}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 rounded px-3 py-2 text-black"
          />
        </div>
      )}

      {/* Se endereço não for encontrado */}
      {formData.manualEndereco && (
        <>
          <div className="mt-4">
            <label className="block text-black font-medium">Logradouro</label>
            <input
              type="text"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 text-black"
            />
          </div>
          <div className="mt-4">
            <label className="block text-black font-medium">Bairro</label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 text-black"
            />
          </div>
          <div className="mt-4">
            <label className="block text-black font-medium">Cidade</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 text-black"
            />
          </div>
          <div className="mt-4">
            <label className="block text-black font-medium">Estado</label>
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded px-3 py-2 text-black"
            />
          </div>
        </>
      )}

      <hr className="my-4 border-t border-gray-400" />

      <div>
        <label className="block font-medium text-black">
          Local da Infração (Rua, número, lote, quadra)
        </label>
        <input
          type="text"
          name="Local"
          onChange={handleChange}
          required
          className="w-full border border-gray-400 rounded px-3 py-2 text-black"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block font-medium text-black">Bairro</label>
          <input
            type="text"
            name="bairro"
            onChange={handleChange}
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>

        <div className="w-1/2">
          <label className="block font-medium text-black">Município</label>
          <input
            type="text"
            name="municipio"
            onChange={handleChange}
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-black">
          Classificação da área
        </label>
        <select
          name="classificacao"
          onChange={handleChange}
          required
          className="w-full border border-gray-400 rounded px-3 py-2 text-black"
        >
          <option value="">Selecione uma opção</option>
          <option value="Particular">Particular</option>
          <option value="Verde">Verde</option>
          <option value="Pública">Pública</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block font-medium text-black">
            Legislação Infrigida
          </label>
          <input
            type="text"
            name="legislação"
            onChange={handleChange}
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>

        <div className="w-1/2">
          <label className="block font-medium text-black">Multa Prevista</label>
          <input
            type="text"
            name="multa"
            onChange={handleChange}
            required
            className="w-full border border-gray-400 rounded px-3 py-2 text-black"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-black">
          Descrição da Infração
        </label>
        <textarea
          name="descricao"
          onChange={handleChange}
          required
          className="w-full border border-gray-400 rounded px-3 py-2 text-black"
        />
      </div>
      <hr className="my-4 border-t border-gray-400" />
      <div className="border border-gray-400 p-4 mt-6">
        <h3 className="text-center font-bold text-black underline mb-2">
          Observações
        </h3>

        <p className="text-justify text-black border-gray-400 border-b py-2">
          Fica o infrator ciente de que poderá reclamar contra o presente Auto
          de Infração Ambiental num prazo máximo de 10 dias, após o qual lhe
          será imposta a multa prevista em Lei.
        </p>

        <p className="text-justify text-black border-gray-400 py-2">
          Este Auto de Infração Ambiental foi gerado em decorrência da
          notificação nº
          <input
            type="text"
            name="numeroNotificacao"
            onChange={handleChange}
            className="border-b border-gray-400 ml-2 w-32 text-black"
            placeholder=""
          />
        </p>
      </div>
      <div className="flex gap-4 mt-6">
        {/* Assinatura do Autuado */}
        <div className="w-1/2">
          <label className="block font-medium text-black">
            Assinatura do Autuado
          </label>
          <div className="border border-gray-400 rounded">
            <SignatureCanvas
              ref={assinaturaRef}
              penColor="black"
              canvasProps={{
                width: 400,
                height: 150,
                className: "border border-gray-400 rounded w-full h-36",
              }}
            />
          </div>
          <button
            type="button"
            onClick={limparAssinatura}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Limpar Assinatura
          </button>
        </div>

        {/* Assinatura do Agente Notificador */}
        <div className="w-1/2">
          <label className="block font-medium text-black">
            Assinatura do Agente Notificador
          </label>
          <div className="border border-gray-400 rounded">
            <SignatureCanvas
              ref={agenteRef}
              penColor="black"
              canvasProps={{
                width: 400,
                height: 150,
                className: "border border-gray-400 rounded w-full h-36",
              }}
            />
          </div>
          <button
            type="button"
            onClick={limparAssinaturaAgente}
            className="mt-2 text-sm text-blue-600 underline"
          >
            Limpar Assinatura
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-400 pt-4">
        <h3 className="text-lg font-bold text-black mb-2">Testemunhas</h3>

        {testemunhas.map((testemunha, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <div className="w-1/2">
              <label className="block text-black font-medium">Nome</label>
              <input
                type="text"
                value={testemunha.nome}
                onChange={(e) =>
                  handleTestemunhaChange(index, "nome", e.target.value)
                }
                className="w-full border border-gray-400 rounded px-3 py-2 text-black"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-black font-medium">CPF</label>
              <input
                type="text"
                value={testemunha.cpf}
                onChange={(e) =>
                  handleTestemunhaChange(
                    index,
                    "cpf",
                    e.target.value.replace(/\D/g, "")
                  )
                }
                className="w-full border border-gray-400 rounded px-3 py-2 text-black"
              />
            </div>
            <button
              type="button"
              onClick={() => removerTestemunha(index)}
              className="text-red-600 underline mt-8"
            >
              Remover
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={adicionarTestemunha}
          className="mt-2 text-blue-600 underline"
        >
          Adicionar Testemunha
        </button>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Enviar
      </button>
    </form>
  );
}
