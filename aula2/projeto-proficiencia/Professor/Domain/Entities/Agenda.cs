public class Agenda
{
    public int Id { get; set; }
    public string DiaDaSemana { get; set; }
    public bool Manha { get; set; }
    public bool Tarde { get; set; }
    public bool Noite { get; set; }
    public int ProfessorId { get; set; }

    public Professor Professor { get; set; }
}