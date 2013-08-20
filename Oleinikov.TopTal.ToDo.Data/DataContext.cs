using System.Data.Entity;
using System.Security.Cryptography;

namespace Oleinikov.TopTal.ToDo.Data
{
    public class DataContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Item> Items { get; set; }

        internal static MD5 Hasher = MD5.Create();

        public DataContext() : base("DataContext")
        {
        }
    }
}