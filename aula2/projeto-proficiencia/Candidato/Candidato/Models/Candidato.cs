namespace Candidato.Models;

public class Candidato
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    public int EmpresaId { get; set; }

    public List<Agendamento> ListaAgendamentos { get; set; } = new List<Agendamento>();
}
