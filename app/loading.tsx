import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return <div className="content loading" role="status"><LoaderCircle className="spin" size={23} /> Carregando dados da Cidadela…</div>;
}
