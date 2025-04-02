import { Response } from 'express';
import { DataSource } from 'typeorm';
import { Controller, Get, Res } from '@nestjs/common';

import * as pkg from '../../../package.json';
import { loadTemplate } from '../../shared/helpers/template-loader/template-loader';

@Controller('')
export class StatusController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async showStatus(@Res() res: Response) {
    let dbStatus = 'UP';
    let statusClass = dbStatus === 'UP' ? 'up' : 'down';
    const template = loadTemplate('status-template.hbs');

    try {
      const isConnected =
        this.dataSource.isInitialized || (await this.dataSource.initialize());
      if (isConnected) {
        dbStatus = 'UP';
        statusClass = 'up';
      }
    } catch {
      dbStatus = 'DOWN';
      statusClass = 'down';
    }

    const html = template({
      dbStatus,
      statusClass,
      apiVersion: pkg.version,
    });

    res.send(html);
  }
}
