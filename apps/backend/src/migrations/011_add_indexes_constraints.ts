import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Foreign key indexes for query performance
  await db.schema.createIndex('idx_region_countryId').on('region').column('countryId').execute();
  await db.schema.createIndex('idx_wine_wineMakerId').on('wine').column('wineMakerId').execute();
  await db.schema.createIndex('idx_wine_regionId').on('wine').column('regionId').execute();
  await db.schema.createIndex('idx_storage_locationId').on('storage').column('locationId').execute();
  await db.schema.createIndex('idx_storage_parent').on('storage').column('parent').execute();
  await db.schema.createIndex('idx_winegrape_wineId').on('winegrape').column('wineId').execute();
  await db.schema.createIndex('idx_winegrape_grapeId').on('winegrape').column('grapeId').execute();
  await db.schema.createIndex('idx_vintage_wineId').on('vintage').column('wineId').execute();
  await db.schema.createIndex('idx_bottle_vintageId').on('bottle').column('vintageId').execute();
  await db.schema.createIndex('idx_bottle_storageId').on('bottle').column('storageId').execute();

  // Unique constraints for data integrity
  await db.schema.createIndex('idx_country_name').on('country').column('name').unique().execute();
  await db.schema.createIndex('idx_grape_name').on('grape').column('name').unique().execute();
  await db.schema.createIndex('idx_location_name').on('location').column('name').unique().execute();
  await db.schema.createIndex('idx_winegrape_wine_grape').on('winegrape').columns(['wineId', 'grapeId']).unique().execute();
  await db.schema.createIndex('idx_region_name_countryId').on('region').columns(['name', 'countryId']).unique().execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_region_countryId').execute();
  await db.schema.dropIndex('idx_wine_wineMakerId').execute();
  await db.schema.dropIndex('idx_wine_regionId').execute();
  await db.schema.dropIndex('idx_storage_locationId').execute();
  await db.schema.dropIndex('idx_storage_parent').execute();
  await db.schema.dropIndex('idx_winegrape_wineId').execute();
  await db.schema.dropIndex('idx_winegrape_grapeId').execute();
  await db.schema.dropIndex('idx_vintage_wineId').execute();
  await db.schema.dropIndex('idx_bottle_vintageId').execute();
  await db.schema.dropIndex('idx_bottle_storageId').execute();
  await db.schema.dropIndex('idx_country_name').execute();
  await db.schema.dropIndex('idx_grape_name').execute();
  await db.schema.dropIndex('idx_location_name').execute();
  await db.schema.dropIndex('idx_winegrape_wine_grape').execute();
  await db.schema.dropIndex('idx_region_name_countryId').execute();
}
