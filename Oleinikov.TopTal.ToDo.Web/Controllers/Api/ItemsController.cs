using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Oleinikov.TopTal.ToDo.Data;
using Oleinikov.TopTal.ToDo.Web.Models.Api;

namespace Oleinikov.TopTal.ToDo.Web.Controllers.Api
{
    public class ItemsController : ApiBaseController
    {
        // GET api/items
        public IEnumerable<ItemModel> Get(
            [FromUri] int? from = default(int?),
            [FromUri] int? count = default(int?),
            [FromUri] string orderBy = null,
            [FromUri] string orderDir = null)
        {
            using (var context = new DataContext())
            {
                var query = context.Entry(GetUser(context)).Collection(u => u.Items).Query();	//.Where(item => item.State > ItemState.Ok);
                
                var desc = string.Equals(orderDir, "desc");
                if (string.Equals(orderBy, "Priority", StringComparison.InvariantCultureIgnoreCase))
                    query = desc ? query.OrderByDescending(i => i.Priority) : query.OrderBy(i => i.Priority);
                else if (string.Equals(orderBy, "CompleteDue", StringComparison.InvariantCultureIgnoreCase))
                    query = desc ? query.OrderByDescending(i => i.CompleteDue) : query.OrderBy(i => i.CompleteDue);
                else if (string.Equals(orderBy, "CreatedOn", StringComparison.InvariantCultureIgnoreCase))
                    query = desc ? query.OrderByDescending(i => i.CreatedOn) : query.OrderBy(i => i.CreatedOn);
                else // if (string.Equals(orderBy, "UpdatedOn", StringComparison.InvariantCultureIgnoreCase))   // default
                    query = desc ? query.OrderByDescending(i => i.UpdatedOn) : query.OrderBy(i => i.UpdatedOn);
                
                if (from > 0)
                    query = query.Skip(from.Value);
                if (count >= 0)
                    query = query.Take(count.Value);
                return query.ToList().Select(i => new ItemModel(i));
            }
        }

        // GET api/items/5
        public ItemModel Get(Guid id)
        {
            using (var context = new DataContext())
            {
				var user = GetUser(context);
				var item = context.Items.Find(id);
				if (item.User != user)
					throw new ApiException("Item.NotFound", "Item not found", HttpStatusCode.NotFound);
                return new ItemModel(item);
            }
        }

        // POST api/items
        public ItemModel Post(ItemDataModel value)
        {
            using (var context = new DataContext())
            {
                var user = GetUser(context);
                var item = value.CreateItem(user);

                context.Items.Add(item);

                context.SaveChanges();

                return new ItemModel(item);
            }
        }

        // PUT api/items/5
        public ItemModel Put(Guid id, ItemDataModel value)
        {
            using (var context = new DataContext())
            {
	            var user = GetUser(context);
                var item = context.Items.Find(id);
                if (item.User != user)
					throw new ApiException("Item.NotFound", "Item not found", HttpStatusCode.NotFound);

                value.UpdateItem(item);

                context.SaveChanges();

                return new ItemModel(item);
            }
        }

        // DELETE api/items/5
        public void Delete(Guid id)
        {
            using (var context = new DataContext())
            {
				var user = GetUser(context);
				var item = context.Items.Find(id);
				if (item.User != user)
					throw new ApiException("Item.NotFound", "Item not found", HttpStatusCode.NotFound);

                context.Items.Remove(item);

                context.SaveChanges();
            }
        }
    }
}
