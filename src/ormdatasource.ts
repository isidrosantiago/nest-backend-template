import { DataSource } from 'typeorm';
import dataSourceOptions from './ormconfig';

export const dataSource = new DataSource(dataSourceOptions);
