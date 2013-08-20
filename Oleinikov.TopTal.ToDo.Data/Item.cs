using System;

namespace Oleinikov.TopTal.ToDo.Data
{
    public class Item
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime UpdatedOn { get; set; }
        public ItemState State { get; set; }
        public Priority Priority { get; set; }
        public DateTime? CompleteDue { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public virtual User User { get; set; }

        protected Item()
        {
        }

        public Item(User user, string title)
        {
            Id = Guid.NewGuid();
			State = ItemState.New;
            CreatedOn = UpdatedOn = DateTime.UtcNow;
            Title = title;
            User = user;
        }
    }
}