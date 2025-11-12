import { useEffect, useMemo, useState } from 'react';
import { busService } from '../services';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

const STATUS_LABELS = {
  AVAILABLE: 'Available',
  HELD: 'Temporarily Held',
  BOOKED: 'Booked',
  RESERVED: 'Reserved'
};

const DEFAULT_SEATS_PER_ROW = 4;
const DEFAULT_HOLD_DURATION_SECONDS = 300;

const normalizeSeats = (seats = [], selections = [], activeHoldToken) => {
  return seats.map((seat, index) => {
    const seatNumber = seat.seatNumber || seat.number || seat.code || String(index + 1);
    const rawStatus = seat.status || seat.state || seat.availability || 'AVAILABLE';
    const status = String(rawStatus).toUpperCase();
    const holdToken = seat.holdToken || seat.reservationToken || null;
    const isHeldByUser = Boolean(holdToken && activeHoldToken && holdToken === activeHoldToken);
    const isSelected = selections.includes(seatNumber) || isHeldByUser;

    const rowIndex =
      seat.rowIndex ??
      seat.row ??
      Math.floor((seat.position ?? index) / DEFAULT_SEATS_PER_ROW) ??
      Math.floor(index / DEFAULT_SEATS_PER_ROW);

    const columnIndex =
      seat.columnIndex ??
      seat.column ??
      (seat.position ?? index) % DEFAULT_SEATS_PER_ROW ??
      index % DEFAULT_SEATS_PER_ROW;

    const deck = seat.deck || seat.level || null;

    return {
      id: seat.id || seatNumber,
      seatNumber,
      status,
      seatType: seat.seatType || seat.type || 'STANDARD',
      holdToken,
      rowIndex,
      columnIndex,
      deck,
      isHeldByUser,
      isSelected,
      meta: seat
    };
  });
};

const deriveSeatRows = (seats) => {
  if (!seats || seats.length === 0) {
    return [];
  }

  const seatsWithPositions = seats
    .map((seat, index) => ({
      ...seat,
      rowIndex: typeof seat.rowIndex === 'number' ? seat.rowIndex : Math.floor(index / DEFAULT_SEATS_PER_ROW),
      columnIndex:
        typeof seat.columnIndex === 'number' ? seat.columnIndex : index % DEFAULT_SEATS_PER_ROW
    }))
    .sort((a, b) => {
      if (a.deck !== b.deck) {
        return (a.deck || '').localeCompare(b.deck || '');
      }
      if (a.rowIndex === b.rowIndex) {
        return a.columnIndex - b.columnIndex;
      }
      return a.rowIndex - b.rowIndex;
    });

  const rows = [];
  seatsWithPositions.forEach((seat) => {
    const deckKey = seat.deck || 'default';
    if (!rows[deckKey]) {
      rows[deckKey] = {};
    }
    if (!rows[deckKey][seat.rowIndex]) {
      rows[deckKey][seat.rowIndex] = [];
    }
    rows[deckKey][seat.rowIndex].push(seat);
  });

  return Object.entries(rows).map(([deck, deckRows]) => ({
    deck,
    rows: Object.entries(deckRows)
      .map(([rowIndex, rowSeats]) => ({
        rowIndex: Number(rowIndex),
        seats: rowSeats.sort((a, b) => a.columnIndex - b.columnIndex)
      }))
      .sort((a, b) => a.rowIndex - b.rowIndex)
  }));
};

const SeatStatusLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <LegendSwatch className="bg-white border border-gray-300 text-gray-600">
        Available
      </LegendSwatch>
      <LegendSwatch className="bg-primary text-white border-primary">
        Selected
      </LegendSwatch>
      <LegendSwatch className="bg-amber-100 border-amber-300 text-amber-700">
        Held
      </LegendSwatch>
      <LegendSwatch className="bg-red-100 border-red-300 text-red-600">
        Booked
      </LegendSwatch>
    </div>
  );
};

const LegendSwatch = ({ className, children }) => (
  <div
    className={cn(
      'flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border',
      className
    )}
  >
    {children}
  </div>
);

const getPayloadData = (response) => {
  if (!response) return {};
  if (response.data?.data) return response.data.data;
  if (response.data) return response.data;
  return response;
};

const BusSeatPicker = ({
  busId,
  tripId,
  legs = [],
  travelers = 1,
  selections = {},
  onSelectionChange,
  className
}) => {
  const [activeLegKey, setActiveLegKey] = useState(legs[0]?.key || null);
  const [seatMaps, setSeatMaps] = useState({});
  const [loadingLeg, setLoadingLeg] = useState({});
  const [errors, setErrors] = useState({});
  const [infoMessages, setInfoMessages] = useState({});

  useEffect(() => {
    if (!activeLegKey && legs.length > 0) {
      setActiveLegKey(legs[0].key);
    }
  }, [legs, activeLegKey]);

  useEffect(() => {
    if (activeLegKey) {
      fetchSeatMap(activeLegKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLegKey, busId]);

  const fetchSeatMap = async (legKey, { force } = {}) => {
    const leg = legs.find((l) => l.key === legKey);
    if (!leg) return;

    const currentSelections = selections[legKey] || {};
    const holdToken = currentSelections.holdToken || undefined;

    if (seatMaps[legKey] && !force) {
      return;
    }

    setLoadingLeg((prev) => ({ ...prev, [legKey]: true }));
    setErrors((prev) => ({ ...prev, [legKey]: null }));

    try {
      const response = await busService.getSeatMap(busId, {
        tripId,
        journeyDate: leg.date,
        holdToken
      });

      const payload = getPayloadData(response);
      const normalizedSeats = normalizeSeats(
        payload.seats || payload.reservations || [],
        currentSelections.seats || [],
        holdToken
      );

      setSeatMaps((prev) => ({
        ...prev,
        [legKey]: {
          seats: normalizedSeats,
          holdToken: payload.holdToken || holdToken || null,
          expiresAt: payload.expiresAt || currentSelections.expiresAt || null,
          fetchedAt: Date.now()
        }
      }));

      if (
        onSelectionChange &&
        (payload.holdToken || payload.expiresAt) &&
        (payload.holdToken !== currentSelections.holdToken ||
          payload.expiresAt !== currentSelections.expiresAt)
      ) {
        onSelectionChange(legKey, {
          ...currentSelections,
          holdToken: payload.holdToken || currentSelections.holdToken || null,
          expiresAt: payload.expiresAt || currentSelections.expiresAt || null
        });
      }
    } catch (error) {
      console.error('Failed to fetch seat map:', error);
      setErrors((prev) => ({
        ...prev,
        [legKey]: error?.message || 'Failed to load seat layout'
      }));
    } finally {
      setLoadingLeg((prev) => ({ ...prev, [legKey]: false }));
    }
  };

  const activeLegSeats = useMemo(() => {
    if (!activeLegKey) return [];
    const seatMap = seatMaps[activeLegKey];
    if (!seatMap) return [];

    return normalizeSeats(
      seatMap.seats,
      selections[activeLegKey]?.seats || [],
      selections[activeLegKey]?.holdToken
    );
  }, [seatMaps, activeLegKey, selections]);

  const seatRows = useMemo(() => deriveSeatRows(activeLegSeats), [activeLegSeats]);

  const activeSelection = selections[activeLegKey] || { seats: [] };
  const activeHoldToken = activeSelection.holdToken;

  const handleSeatToggle = async (seat) => {
    if (!activeLegKey) return;
    if (!onSelectionChange) return;

    const currentSelection = selections[activeLegKey]?.seats || [];
    const isSelected = currentSelection.includes(seat.seatNumber);
    const currentHoldToken = selections[activeLegKey]?.holdToken || null;
    const leg = legs.find((l) => l.key === activeLegKey);
    if (!leg) return;

    if (!isSelected && currentSelection.length >= travelers) {
      setInfoMessages((prev) => ({
        ...prev,
        [activeLegKey]: `You can select up to ${travelers} seat${travelers > 1 ? 's' : ''}.`
      }));
      return;
    }

    try {
      setInfoMessages((prev) => ({ ...prev, [activeLegKey]: null }));

      if (seat.status === 'BOOKED' || (seat.status === 'HELD' && !seat.isHeldByUser)) {
        return;
      }

      if (isSelected) {
        if (currentHoldToken) {
          try {
            await busService.releaseSeats(busId, currentHoldToken, {
              tripId,
              journeyDate: leg.date,
              seatNumbers: [seat.seatNumber]
            });
          } catch (releaseError) {
            console.warn('Failed to release seat (will continue locally):', releaseError);
          }
        }

        const updatedSeats = currentSelection.filter((s) => s !== seat.seatNumber);
        onSelectionChange(activeLegKey, {
          ...selections[activeLegKey],
          seats: updatedSeats
        });
      } else {
        const payload = {
          tripId,
          journeyDate: leg.date,
          seatNumbers: [seat.seatNumber],
          holdToken: currentHoldToken || undefined
        };

        let newHoldToken = currentHoldToken;
        let expiresAt = selections[activeLegKey]?.expiresAt || null;

        try {
          const response = await busService.holdSeats(busId, payload);
          const data = getPayloadData(response);
          newHoldToken = data.holdToken || data.reservationToken || newHoldToken;
          expiresAt = data.expiresAt || expiresAt;
        } catch (holdError) {
          console.warn('Failed to hold seat (local selection only):', holdError);
        }

        const updatedSeats = [...currentSelection, seat.seatNumber];
        onSelectionChange(activeLegKey, {
          seats: updatedSeats,
          holdToken: newHoldToken || null,
          expiresAt: expiresAt || null
        });
      }
    } catch (error) {
      console.error('Seat toggle failed:', error);
      setErrors((prev) => ({
        ...prev,
        [activeLegKey]: error?.message || 'Unable to update seat selection'
      }));
    }
  };

  const handleClearSelection = async () => {
    if (!activeLegKey) return;
    if (!onSelectionChange) return;

    const currentHoldToken = selections[activeLegKey]?.holdToken;
    const leg = legs.find((l) => l.key === activeLegKey);
    if (!leg) return;

    if (currentHoldToken) {
      try {
        await busService.releaseSeats(busId, currentHoldToken, {
          tripId,
          journeyDate: leg.date
        });
      } catch (error) {
        console.warn('Failed to release hold token:', error);
      }
    }

    onSelectionChange(activeLegKey, {
      seats: [],
      holdToken: null,
      expiresAt: null
    });
  };

  const renderSeat = (seat) => {
    const isUnavailable = seat.status === 'BOOKED' || (seat.status === 'HELD' && !seat.isHeldByUser);
    const isSelected = seat.isSelected;
    const isHeld = seat.status === 'HELD' && seat.isHeldByUser;

    return (
      <button
        key={seat.id}
        type="button"
        onClick={() => handleSeatToggle(seat)}
        disabled={isUnavailable}
        className={cn(
          'w-12 h-12 rounded-md border flex items-center justify-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isSelected && 'bg-primary text-white border-primary shadow-sm',
          isHeld && !isSelected && 'bg-amber-100 text-amber-700 border-amber-300',
          isUnavailable && 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed',
          !isSelected && !isUnavailable && 'bg-white hover:bg-primary/10 text-gray-700 border-gray-300'
        )}
        aria-pressed={isSelected}
        aria-label={`Seat ${seat.seatNumber} ${STATUS_LABELS[seat.status] || seat.status}`}
      >
        {seat.seatNumber.replace(/\D+/g, '') || seat.seatNumber}
      </button>
    );
  };

  const renderDeckSection = (deckSection) => {
    return (
      <div key={deckSection.deck || 'default'} className="space-y-3">
        {deckSection.deck && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{deckSection.deck}</Badge>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {deckSection.rows.map((row) => (
            <div key={`${deckSection.deck || 'deck'}-${row.rowIndex}`} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderSeat(row.seats[0])}
                {row.seats[1] && renderSeat(row.seats[1])}
              </div>
              <div className="w-6" aria-hidden="true" />
              <div className="flex items-center gap-2">
                {row.seats[2] && renderSeat(row.seats[2])}
                {row.seats[3] && renderSeat(row.seats[3])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeatLayout = () => {
    if (!activeLegKey) {
      return (
        <div className="text-sm text-gray-500">
          Select a journey leg to view available seats.
        </div>
      );
    }

    if (loadingLeg[activeLegKey]) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading seats...
        </div>
      );
    }

    if (errors[activeLegKey]) {
      return (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {errors[activeLegKey]}
          <Button variant="ghost" size="sm" onClick={() => fetchSeatMap(activeLegKey, { force: true })}>
            Retry
          </Button>
        </div>
      );
    }

    if (!seatRows.length) {
      return (
        <div className="text-sm text-gray-500">
          Seat map not available for this bus. Please contact support.
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {seatRows.map(renderDeckSection)}
      </div>
    );
  };

  const legTabs = (
    <div className="flex flex-wrap items-center gap-2">
      {legs.map((leg) => {
        const isActive = leg.key === activeLegKey;
        const selectedCount = selections[leg.key]?.seats?.length || 0;

        return (
          <Button
            key={leg.key}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLegKey(leg.key)}
            className="gap-2"
          >
            <span>{leg.label}</span>
            <Badge variant={isActive ? 'secondary' : 'outline'}>
              {selectedCount}/{travelers}
            </Badge>
          </Button>
        );
      })}
    </div>
  );

  const holdExpiresAt = activeSelection?.expiresAt ? new Date(activeSelection.expiresAt) : null;
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_HOLD_DURATION_SECONDS);

  useEffect(() => {
    if (!holdExpiresAt) {
      setRemainingSeconds(DEFAULT_HOLD_DURATION_SECONDS);
      return undefined;
    }

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.round((holdExpiresAt.getTime() - now) / 1000));
      setRemainingSeconds(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  return (
    <Card className={cn('shadow-none border border-dashed border-gray-200 bg-gray-50', className)}>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {legTabs}

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Selecting for {travelers} traveler{travelers > 1 ? 's' : ''}
            </Badge>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => activeLegKey && fetchSeatMap(activeLegKey, { force: true })}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              Clear
            </Button>
          </div>
        </div>

        <SeatStatusLegend />

        {holdExpiresAt && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            Seats held for {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s
          </div>
        )}

        {infoMessages[activeLegKey] && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            {infoMessages[activeLegKey]}
          </div>
        )}

        {renderSeatLayout()}

        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-900">Selected Seats</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(activeSelection.seats || []).length > 0 ? (
              activeSelection.seats.map((seatNumber) => (
                <Badge key={seatNumber} variant="secondary">
                  {seatNumber}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500">No seats selected yet.</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusSeatPicker;

