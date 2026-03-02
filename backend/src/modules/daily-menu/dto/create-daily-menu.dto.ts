import { IsArray, IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateDailyMenuDto {
  @IsNotEmpty()
  @IsDateString()
  date: string; // ISO String: "2026-01-30"

  @IsArray()
  @IsMongoId({ each: true })
  dishIds: string[]; // ["67890...", "12345..."]
}