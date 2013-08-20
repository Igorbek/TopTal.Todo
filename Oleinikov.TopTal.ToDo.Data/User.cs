using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Oleinikov.TopTal.ToDo.Data
{
    public class User
    {
        public Guid Id { get; set; }
        public UserState State { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
        public string Name { get; set; }

        public byte[] SecretData { get; set; }
        public byte[] PasswordHash { get; set; }

        public User()
        {
            Id = Guid.NewGuid();
			State = UserState.Confirmed;
            CreatedOn = UpdatedOn = DateTime.UtcNow;
            Items = new List<Item>();
        }

        public virtual ICollection<Item> Items { get; set; }

        public byte[] CalculatePasswordHash(string value)
        {
            if (SecretData == null)
                return null;
            return DataContext.Hasher.ComputeHash(SecretData.Concat(Encoding.Default.GetBytes(value)).ToArray());
        }

	    public byte[] CalculateSecretDataHash(byte[] value)
	    {
			if (SecretData == null)
				return null;
			return DataContext.Hasher.ComputeHash(SecretData.Concat(value).ToArray());
	    }

        public string Password
        {
            set
            {
                if (value == null)
                    PasswordHash = null;
                else
                {
                    if (SecretData == null)
                        SecretData = Guid.NewGuid().ToByteArray();
                    PasswordHash = CalculatePasswordHash(value);
                }
            }
        }
    }
}
