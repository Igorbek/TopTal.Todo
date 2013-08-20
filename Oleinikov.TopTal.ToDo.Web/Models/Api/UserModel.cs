using System;
using System.ComponentModel.DataAnnotations;
using Oleinikov.TopTal.ToDo.Data;

namespace Oleinikov.TopTal.ToDo.Web.Models.Api
{
    public class UserModel: UserDataModel
    {
        public UserModel(User user) : base(user)
        {
            Id = user.Id;
        }

        public Guid Id { get; set; }
    }

    public class UserDataModel
    {
        [MinLength(1), MaxLength(60), RegularExpression("^\\w+$", ErrorMessage = "Name should contain only letters.")]
		public string Name { get; set; }

        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }

        public UserDataModel()
        {
        }

        public UserDataModel(User user)
        {
            Name = user.Name;
            CreatedOn = user.CreatedOn;
            UpdatedOn = user.UpdatedOn;
        }

        public virtual void UpdateUser(User user)
        {
            user.Name = Name;
            user.UpdatedOn = UpdatedOn = DateTime.UtcNow;
        }

        public User CreateUser()
        {
            var user = new User();
            UpdateUser(user);
            return user;
        }
    }

    public class UserCreateModel : UserDataModel
    {
        [MinLength(6)] public string Password { get; set; }

        public override void UpdateUser(User user)
        {
            base.UpdateUser(user);
            user.Password = Password;
        }
    }

	public class UserUpdateModel : UserCreateModel
	{
		public override void UpdateUser(User user)
		{
			var prevName = user.Name;
			base.UpdateUser(user);
			user.Name = prevName;
		}
	}

    public class UserAuthModel
    {
        public UserModel User { get; set; }
        public string AuthToken { get; set; }
		public string AutoLoginToken { get; set; }
    }
}