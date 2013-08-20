using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Oleinikov.TopTal.ToDo.Data.Tests
{
    [TestClass]
    public class DataContextTests
    {
        [TestMethod]
        public void CreateUserAndItemThenDelete()
        {
            Guid userId, itemId;
            const string taskName = "Task 1";

            using (var context = new DataContext())
            {
                var user = new User();
                var item = new Item(user, taskName)
                {
                    Priority = Priority.High,
                    CompleteDue = DateTime.UtcNow.AddDays(1).Date
                };
                user.Items.Add(item);
                context.Users.Add(user);
                context.SaveChanges();

                userId = user.Id;
                itemId = item.Id;
            }

            using (var context = new DataContext())
            {
                var user = context.Users.Find(userId);

                Assert.AreEqual(UserState.Anonymous, user.State);
                Assert.AreEqual(1, user.Items.Count);

                var item = context.Items.Find(itemId);

                Assert.AreEqual(ItemState.New, item.State);
                Assert.AreEqual(taskName, item.Title);
                Assert.AreEqual(Priority.High, item.Priority);

                context.Items.Remove(item);
                context.Users.Remove(user);

                context.SaveChanges();
            }

            using (var context = new DataContext())
            {
                Assert.IsNull(context.Users.Find(userId));
                Assert.IsNull(context.Items.Find(itemId));
            }
        }
    }
}
