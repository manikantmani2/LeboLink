import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    try {
      const hashedPassword123 = await bcrypt.hash('Test@1234', 10);

      // Create admin user
      const adminExists = await this.userModel.findOne({ phone: '9155682599' });
      if (!adminExists) {
        const hashedAdminPassword = await bcrypt.hash('Hello@&1234', 10);
        await this.userModel.create({
          phone: '9155682599',
          name: 'Admin User',
          email: 'admin@lebolink.com',
          role: 'admin',
          passwordHash: hashedAdminPassword,
        });
        console.log('✓ Admin user created');
        console.log('[SEED] Admin credentials:');
        console.log('  Phone: 9155682599');
        console.log('  Password: Hello@&1234');
      }

      // Create test WORKER users with hashed passwords
      const workers = [
        { 
          phone: '9999990001', 
          name: 'Amit Sharma', 
          email: 'amit@lebolink.com',
          skills: ['Electrical'],
          jobCategory: 'Electrical',
          paymentPerHour: 800,
          preferredLocation: 'Bangalore',
          nextAvailableDate: '2026-03-01'
        },
        { 
          phone: '9999990002', 
          name: 'Priya Verma', 
          email: 'priya@lebolink.com',
          skills: ['Cleaning'],
          jobCategory: 'Cleaning',
          paymentPerHour: 600,
          preferredLocation: 'Mumbai',
          nextAvailableDate: '2026-02-28'
        },
        { 
          phone: '9999990003', 
          name: 'Rahul Singh', 
          email: 'rahul@lebolink.com',
          skills: ['Plumbing'],
          jobCategory: 'Plumbing',
          paymentPerHour: 700,
          preferredLocation: 'Delhi',
          nextAvailableDate: '2026-03-05'
        },
      ];

      for (const workerData of workers) {
        const workerExists = await this.userModel.findOne({ phone: workerData.phone });
        if (!workerExists) {
          await this.userModel.create({
            phone: workerData.phone,
            name: workerData.name,
            email: workerData.email,
            role: 'worker',
            password: hashedPassword123,
            skills: workerData.skills,
            jobCategory: workerData.jobCategory,
            paymentPerHour: workerData.paymentPerHour,
            preferredLocation: workerData.preferredLocation,
            nextAvailableDate: workerData.nextAvailableDate,
            accountStatus: 'active',
            workerApproval: {
              status: 'approved',
              approvedAt: new Date(),
              approvedBy: 'system-seed',
              updatedAt: new Date(),
            },
          });
          console.log(`✓ Test Worker created: ${workerData.name} (Phone: ${workerData.phone})`);
        } else {
          await this.userModel.updateOne(
            { _id: workerExists._id },
            {
              $set: {
                accountStatus: 'active',
                workerApproval: {
                  status: 'approved',
                  approvedAt: new Date(),
                  approvedBy: 'system-seed',
                  updatedAt: new Date(),
                },
              },
            },
          );
        }
      }

      // Create test CUSTOMER users with hashed passwords
      const customers = [
        { 
          phone: '9888880001', 
          name: 'Rajesh Kumar', 
          email: 'rajesh@example.com'
        },
        { 
          phone: '9888880002', 
          name: 'Neha Gupta', 
          email: 'neha@example.com'
        },
        { 
          phone: '9888880003', 
          name: 'Vikram Singh', 
          email: 'vikram@example.com'
        },
      ];

      for (const customerData of customers) {
        const customerExists = await this.userModel.findOne({ phone: customerData.phone });
        if (!customerExists) {
          await this.userModel.create({
            phone: customerData.phone,
            name: customerData.name,
            email: customerData.email,
            role: 'customer',
            password: hashedPassword123,
          });
          console.log(`✓ Test Customer created: ${customerData.name} (Phone: ${customerData.phone})`);
        }
      }

      console.log('\n[SEED] Test Login Credentials:');
      console.log('┏─ WORKERS (Password: Test@1234)');
      workers.forEach(w => console.log(`┃  Phone: ${w.phone} (${w.name})`));
      console.log('┣─ CUSTOMERS (Password: Test@1234)');
      customers.forEach(c => console.log(`┃  Phone: ${c.phone} (${c.name})`));
      console.log('┗─ ADMIN (Password: Hello@&1234)');
      console.log('   Phone: 9155682599 (Admin User)\n');

    } catch (error) {
      console.error('Error during seeding:', error);
    }
  }
}
