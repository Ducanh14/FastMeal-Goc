import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { Dish } from './modules/dishes/schemas/dish.schema';
import { DailyMenu } from './modules/daily-menu/schemas/daily-menu.schema';
import { User } from './modules/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dishModel = app.get<Model<Dish>>('DishModel');
  const dailyMenuModel = app.get<Model<DailyMenu>>('DailyMenuModel');
  const userModel = app.get<Model<User>>('UserModel');
  
  // Clear existing data
  await dishModel.deleteMany({});
  await dailyMenuModel.deleteMany({});
  await userModel.deleteMany({});

  // Seed admin account
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await userModel.create({
    username: 'admin',
    fullName: 'Admin User',
    email: 'admin@fastmeal.com',
    password: hashedPassword,
    role: 'admin',
  });
  console.log('👤 Created admin account (username: admin / admin123)');
  
  // Seed dishes with Vietnamese names and categories
  const dishes = [
    {
      name: 'Cánh gà BBQ',
      description: 'Cánh gà nướng sốt BBQ thơm lừng, giòn bên ngoài, mềm bên trong',
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà cay',
      description: 'Cánh gà chiên giòn tẩm sốt cay buffalo đặc biệt',
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà tỏi',
      description: 'Cánh gà chiên giòn với sốt bơ tỏi thơm ngậy',
      price: 12.99,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Cánh gà mật ong',
      description: 'Cánh gà tẩm mật ong nướng vàng, vị ngọt tự nhiên',
      price: 13.99,
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80',
      category: 'Wings',
      isAvailable: true,
    },
    {
      name: 'Bánh mì gà giòn',
      description: 'Gà chiên giòn kẹp với rau sống, dưa leo và sốt mayo',
      price: 9.99,
      imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80',
      category: 'Sandwiches',
      isAvailable: true,
    },
    {
      name: 'Bánh mì gà cay',
      description: 'Gà chiên tẩm sốt cay đặc biệt kèm rau sống tươi',
      price: 10.99,
      imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&q=80',
      category: 'Sandwiches',
      isAvailable: true,
    },
    {
      name: 'Khoai tây chiên',
      description: 'Khoai tây chiên giòn vàng với gia vị đặc biệt',
      price: 4.99,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
      category: 'Fries',
      isAvailable: true,
    },
    {
      name: 'Khoai tây phô mai',
      description: 'Khoai tây chiên phủ phô mai, thịt xông khói và sốt ranch',
      price: 7.99,
      imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&q=80',
      category: 'Fries',
      isAvailable: true,
    },
  ];
  
  const insertedDishes = await dishModel.insertMany(dishes);
  console.log(`📦 Inserted ${insertedDishes.length} dishes`);

  // Create weekly menus - assign 4 dishes per day
  const monday = new Date();
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const dishIds = insertedDishes.map(d => d._id);

  for (let i = 0; i < 7; i++) {
    const menuDate = new Date(monday);
    menuDate.setDate(menuDate.getDate() + i);
    menuDate.setHours(0, 0, 0, 0);

    // Pick 4 dishes for each day (rotating selection)
    const dayDishes: typeof dishIds = [];
    for (let j = 0; j < 4; j++) {
      dayDishes.push(dishIds[(i + j) % dishIds.length]);
    }

    await dailyMenuModel.findOneAndUpdate(
      { date: menuDate },
      { dishes: dayDishes, createdBy: 'admin_dummy_id' },
      { upsert: true, new: true },
    );
  }

  console.log('📅 Created weekly menus (4 dishes/day)');
  console.log('✅ Database seeded successfully!');

  await app.close();
}

seedDatabase().catch((error) => {
  console.error('❌ Error seeding database:', error);
  process.exit(1);
});
