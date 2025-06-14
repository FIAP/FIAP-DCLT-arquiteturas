public class ADM
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }

    public List<Empresa> ListaEmpresas { get; set; } = new List<Empresa>();
    public List<Professor> ListaProfessores { get; set; } = new List<Professor>();
}