using System;
using System.ComponentModel.DataAnnotations;
using Oleinikov.TopTal.ToDo.Data;

namespace Oleinikov.TopTal.ToDo.Web.Models.Api
{
    public class ItemModel : ItemDataModel
    {
        public ItemModel(Item item): base(item)
        {
            Id = item.Id;
        }

        public Guid Id { get; set; } 
    }

    public class ItemDataModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? CompleteDue { get; set; }
        public Priority? Priority { get; set; }
		public ItemState? State { get; set; }

        public ItemDataModel()
        {
        }

        protected ItemDataModel(Item item)
        {
            Title = item.Title;
            Description = item.Description;
            CompleteDue = item.CompleteDue;
            Priority = item.Priority;
	        State = item.State;
        }

        public void UpdateItem(Item item)
        {
            item.Title = Title;
            item.Description = Description;
            item.CompleteDue = CompleteDue;
            if (Priority.HasValue)
				item.Priority = Priority.Value;
			if (State.HasValue && (State.Value >= ItemState.Deleted || State.Value <= ItemState.InProgress) && State.Value != ItemState.Ok)
				item.State = State.Value;
        }

        public Item CreateItem(User user)
        {
            var item = new Item(user, Title);
            UpdateItem(item);
            return item;
        }
    }

	public class UserLoginModel
	{
		[Required, MinLength(1)] public string Name { get; set; }
		[Required] public string Password { get; set; }
	}

}