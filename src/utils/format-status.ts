export const FormatStatus = (
  status: "pending" | "in_progress" | "completed"
) => {
  switch (status) {
    case "pending":
      return "Pendente";
    case "in_progress":
      return "Em Progresso";
    case "completed":
      return "Concluído";
    default:
      return "Pendente";
  }
};
