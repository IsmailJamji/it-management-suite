import { Database } from '../database/database';

export class TelecomAssetsService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  public async getAll(): Promise<any> {
    try {
      const assets = await this.database.getAllTelecomAssets();
      return {
        success: true,
        data: assets
      };
    } catch (error) {
      console.error('Error getting telecom assets:', error);
      return {
        success: false,
        message: 'Failed to get telecom assets',
        data: []
      };
    }
  }

  public async create(assetData: any): Promise<any> {
    try {
      const result = await this.database.createTelecomAsset(assetData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error creating telecom asset:', error);
      return {
        success: false,
        message: 'Failed to create telecom asset'
      };
    }
  }

  public async update(id: number, assetData: any): Promise<any> {
    try {
      await this.database.updateTelecomAsset(id, assetData);
      return {
        success: true,
        message: 'Telecom asset updated successfully'
      };
    } catch (error) {
      console.error('Error updating telecom asset:', error);
      return {
        success: false,
        message: 'Failed to update telecom asset'
      };
    }
  }

  public async delete(id: number): Promise<any> {
    try {
      await this.database.deleteTelecomAsset(id);
      return {
        success: true,
        message: 'Telecom asset deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting telecom asset:', error);
      return {
        success: false,
        message: 'Failed to delete telecom asset'
      };
    }
  }

  public async import(filePath: string, format: string): Promise<any> {
    try {
      const result = await this.database.importTelecomAssets(filePath, format);
      return {
        success: true,
        message: 'Telecom assets imported successfully',
        data: result
      };
    } catch (error) {
      console.error('Error importing telecom assets:', error);
      return {
        success: false,
        message: 'Failed to import telecom assets'
      };
    }
  }

  public async export(format: string, filePath: string): Promise<any> {
    try {
      const result = await this.database.exportTelecomAssets(format);
      return {
        success: true,
        message: 'Telecom assets exported successfully',
        data: result
      };
    } catch (error) {
      console.error('Error exporting telecom assets:', error);
      return {
        success: false,
        message: 'Failed to export telecom assets'
      };
    }
  }
}
