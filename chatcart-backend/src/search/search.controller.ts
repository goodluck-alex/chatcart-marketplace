import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private svc: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search across all listings (Meilisearch)' })
  @ApiQuery({ name: 'q',              required: false })
  @ApiQuery({ name: 'category',       required: false })
  @ApiQuery({ name: 'city',           required: false })
  @ApiQuery({ name: 'minPrice',       required: false, type: Number })
  @ApiQuery({ name: 'maxPrice',       required: false, type: Number })
  @ApiQuery({ name: 'isFeatured',     required: false, type: Boolean })
  @ApiQuery({ name: 'sellerVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy',         required: false, enum: ['price_asc','price_desc','newest','rating'] })
  @ApiQuery({ name: 'page',           required: false, type: Number })
  @ApiQuery({ name: 'limit',          required: false, type: Number })
  search(
    @Query('q')              q?: string,
    @Query('category')       category?: string,
    @Query('city')           city?: string,
    @Query('minPrice')       minPrice?: number,
    @Query('maxPrice')       maxPrice?: number,
    @Query('isFeatured')     isFeatured?: boolean,
    @Query('sellerVerified') sellerVerified?: boolean,
    @Query('sortBy')         sortBy?: string,
    @Query('page')           page = 1,
    @Query('limit')          limit = 20,
  ) {
    return this.svc.search(q ?? '', { category, city, minPrice, maxPrice, isFeatured, sellerVerified, sortBy, page: +page, limit: +limit });
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Autocomplete suggestions as user types' })
  @ApiQuery({ name: 'q', required: true })
  suggest(@Query('q') q: string, @Query('limit') limit = 5) {
    return this.svc.suggest(q, +limit);
  }
}
