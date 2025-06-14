public class Agendamento
{
    public int Id { get; set; }
    public int CandidatoId { get; set; }
    public DateTime DataAgendamento { get; set; }
    public string Feedback { get; set; }
    public string Status { get; set; }

    public Candidato Candidato { get; set; }
}