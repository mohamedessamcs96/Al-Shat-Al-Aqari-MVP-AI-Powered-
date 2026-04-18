import { useState, useEffect } from 'react';
import { MapPin, Bed, Bath, Maximize2, Star, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { PropertiesBlockData, Theme } from '../../lib/page-builder-types';
import { formatPrice, getCityName } from '../../lib/formatters';
import { offices as officesApi, listings as listingsApi } from '../../lib/api-client';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  data: PropertiesBlockData;
  theme: Theme;
  officeId?: string;
  isEditing?: boolean;
}

const PROPERTY_TYPES_AR: Record<string, string> = {
  Villa: 'فيلا',
  Apartment: 'شقة',
  Office: 'مكتب',
  Land: 'أرض',
  Shop: 'محل تجاري',
  Warehouse: 'مستودع',
};

export function PropertiesBlock({ data, theme, officeId, isEditing }: Props) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBedrooms, setFilterBedrooms] = useState<string>('all');
  const [allListings, setAllListings] = useState<any[]>([]);

  useEffect(() => {
    if (officeId) {
      officesApi.listListings(officeId).then((res: any) => {
        setAllListings(Array.isArray(res) ? res : (res?.results ?? []));
      }).catch(() => setAllListings([]));
    } else {
      listingsApi.list().then((res: any) => {
        setAllListings(Array.isArray(res) ? res : (res?.results ?? []));
      }).catch(() => setAllListings([]));
    }
  }, [officeId]);

  // Filter listings
  let listings: any[] = allListings;

  if (data.filter.status && data.filter.status !== 'all') {
    listings = listings.filter((l) => l.status === data.filter.status);
  }
  if (data.filter.type && data.filter.type.length > 0) {
    listings = listings.filter((l) => data.filter.type!.includes(l.property_type));
  }
  if (filterType !== 'all') {
    listings = listings.filter((l) => l.property_type === filterType);
  }
  if (filterBedrooms !== 'all') {
    listings = listings.filter((l) => l.bedrooms >= parseInt(filterBedrooms));
  }

  listings = listings.slice(0, data.maxItems);

  const uniqueTypes = [...new Set(allListings.map((l: any) => l.property_type as string))];

  const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className="py-10 px-4 max-w-6xl mx-auto" dir="rtl">
      {/* Section header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.textColor }}>{data.title}</h2>
          {data.subtitle && (
            <p className="text-sm mt-1" style={{ color: theme.mutedColor }}>{data.subtitle}</p>
          )}
        </div>
        {data.showViewAll && (
          <button
            onClick={() => !isEditing && navigate('/office/listings')}
            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: theme.primaryColor }}
          >
            عرض الكل
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {data.showFilters && (
        <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-2xl" style={{ background: theme.cardBgColor, border: `1px solid ${theme.mutedColor}22` }}>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: theme.mutedColor }} />
            <span className="text-sm font-medium" style={{ color: theme.mutedColor }}>تصفية:</span>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue placeholder="نوع العقار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>{PROPERTY_TYPES_AR[t] || t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterBedrooms} onValueChange={setFilterBedrooms}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue placeholder="الغرف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الغرف</SelectItem>
              <SelectItem value="1">1+ غرف</SelectItem>
              <SelectItem value="2">2+ غرف</SelectItem>
              <SelectItem value="3">3+ غرف</SelectItem>
              <SelectItem value="4">4+ غرف</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs self-center" style={{ color: theme.mutedColor }}>
            {listings.length} عقار
          </span>
        </div>
      )}

      {/* Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: theme.cardBgColor }}>
          <p style={{ color: theme.mutedColor }}>لا توجد عقارات متاحة حالياً</p>
        </div>
      ) : (
        <div className={`grid ${colsMap[data.columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-5`}>
          {listings.map((listing) => (
            <PropertyCard
              key={listing.id}
              listing={listing}
              cardStyle={data.cardStyle}
              theme={theme}
              showPrice={data.showPrice}
              showArea={data.showArea}
              showBedrooms={data.showBedrooms}
              onNavigate={() => !isEditing && navigate(`/listings/${listing.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardProps {
  listing: any;
  cardStyle: string;
  theme: Theme;
  showPrice: boolean;
  showArea: boolean;
  showBedrooms: boolean;
  onNavigate: () => void;
}

function PropertyCard({ listing, cardStyle, theme, showPrice, showArea, showBedrooms, onNavigate }: CardProps) {
  const isOverlay = cardStyle === 'overlay';
  const isMinimal = cardStyle === 'minimal';
  const isDetailed = cardStyle === 'detailed';

  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ background: theme.cardBgColor, border: `1px solid ${theme.mutedColor}22`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      onClick={onNavigate}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: isMinimal ? 160 : 200 }}>
        <img
          src={listing.images[0]}
          alt={listing.property_type}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {showPrice && (
          <span
            className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
            style={{ background: theme.primaryColor }}
          >
            {formatPrice(listing.price)}
          </span>
        )}
        {listing.quality_score >= 90 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            مميز
          </span>
        )}

        {isOverlay && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3" dir="rtl">
            <h3 className="text-white font-bold text-base">{PROPERTY_TYPES_AR[listing.property_type] || listing.property_type}</h3>
            <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{listing.address}</span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `${theme.primaryColor}cc` }}
        >
          <span className="bg-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg" style={{ color: theme.primaryColor }} dir="rtl">
            عرض التفاصيل
          </span>
        </div>
      </div>

      {/* Content */}
      {!isOverlay && (
        <div className="p-4" dir="rtl">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-base" style={{ color: theme.textColor }}>
              {PROPERTY_TYPES_AR[listing.property_type] || listing.property_type}
            </h3>
            <Badge variant="outline" className="text-xs">{listing.status === 'active' ? 'متاح' : 'مباع'}</Badge>
          </div>

          <div className="flex items-center gap-1 text-xs mb-3" style={{ color: theme.mutedColor }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{listing.address}</span>
          </div>

          {(showBedrooms || showArea) && (
            <div className="flex gap-3 text-sm mb-3" style={{ color: theme.mutedColor }}>
              {showBedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  <strong style={{ color: theme.textColor }}>{listing.bedrooms}</strong> غرف
                </span>
              )}
              {showBedrooms && showArea && <span style={{ color: `${theme.mutedColor}50` }}>|</span>}
              {showArea && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <strong style={{ color: theme.textColor }}>{listing.area}</strong> م²
                </span>
              )}
            </div>
          )}

          {isDetailed && (
            <div className="flex flex-wrap gap-1.5">
              {listing.features.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ background: `${theme.primaryColor}12`, color: theme.primaryColor }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
