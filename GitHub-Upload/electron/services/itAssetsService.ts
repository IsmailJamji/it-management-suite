import { Database } from '../database/database';

export class ITAssetsService {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  public async getAll(): Promise<any> {
    try {
      const assets = await this.database.getAllITAssets();
      return {
        success: true,
        data: assets
      };
    } catch (error) {
      console.error('Error getting IT assets:', error);
      return {
        success: false,
        message: 'Failed to get IT assets',
        data: []
      };
    }
  }

  public async create(assetData: any): Promise<any> {
    try {
      const result = await this.database.createITAsset(assetData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error creating IT asset:', error);
      return {
        success: false,
        message: 'Failed to create IT asset'
      };
    }
  }

  public async update(id: number, assetData: any): Promise<any> {
    try {
      await this.database.updateITAsset(id, assetData);
      return {
        success: true,
        message: 'IT asset updated successfully'
      };
    } catch (error) {
      console.error('Error updating IT asset:', error);
      return {
        success: false,
        message: 'Failed to update IT asset'
      };
    }
  }

  public async delete(id: number): Promise<any> {
    try {
      await this.database.deleteITAsset(id);
      return {
        success: true,
        message: 'IT asset deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting IT asset:', error);
      return {
        success: false,
        message: 'Failed to delete IT asset'
      };
    }
  }

  public async import(filePath: string, format: string): Promise<any> {
    try {
      const result = await this.database.importITAssets(filePath, format);
      return {
        success: true,
        message: 'IT assets imported successfully',
        data: result
      };
    } catch (error) {
      console.error('Error importing IT assets:', error);
      return {
        success: false,
        message: 'Failed to import IT assets'
      };
    }
  }

  public async export(format: string, filePath: string): Promise<any> {
    try {
      const result = await this.database.exportITAssets(format);
      return {
        success: true,
        message: 'IT assets exported successfully',
        data: result
      };
    } catch (error) {
      console.error('Error exporting IT assets:', error);
      return {
        success: false,
        message: 'Failed to export IT assets'
      };
    }
  }
}
