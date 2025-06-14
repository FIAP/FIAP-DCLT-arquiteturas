public class Professor
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }

    public List<Agendamento> ListaAgendamentos { get; set; } = new List<Agendamento>();
}