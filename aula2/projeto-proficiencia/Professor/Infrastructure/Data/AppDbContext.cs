using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Professor> Professores { get; set; }
    public DbSet<Agenda> Agendas { get; set; }
    public DbSet<Agendamento> Agendamentos { get; set; }
    public DbSet<Candidato> Candidatos { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
}