using System.Data.Entity;

namespace Oleinikov.TopTal.ToDo.Data
{
    public class DropCreateDatabaseIfModelChangesDataContextInitializer : DropCreateDatabaseIfModelChanges<DataContext>
    {
    }
	public class CreateDatabaseIfNotExistsDataContextInitializer : CreateDatabaseIfNotExists<DataContext>
    {
    }
}