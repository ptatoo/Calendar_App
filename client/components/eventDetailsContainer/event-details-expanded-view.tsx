import { EventObj } from '@/utility/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ExpandedViewProps {
  event: EventObj;
}

const HorizontalBar = () => <View style={styles.bar} />;

export const EventExpandedView = ({ event }: ExpandedViewProps) => {
  // Logic to check if this is a recurring instance
  const isRecurring = !!event.recurringEventId || (event.recurrence && event.recurrence.length > 0);

  return (
    <View style={styles.container}>
      <HorizontalBar />

      {/* Section 1: People */}
      <View style={styles.section}>
        <Text style={styles.value}>Organizer: {event.organizer}</Text>
        {/* If you start fetching attendees later, you'd map them here */}
        <Text style={styles.valueSecondary}>Type: {event.eventType}</Text>
      </View>

      <HorizontalBar />

      {/* Section 2: Location */}
      <View style={styles.section}>
        <Text style={styles.valueSecondary}>Location: {event.location || 'No location provided'}</Text>
      </View>

      <HorizontalBar />

      {/* Section 3: Calendar & Series Status */}
      <View style={styles.section}>
        <View style={styles.row}>
          {/* Visual indicator using the dynamic color we injected */}
          <View style={[styles.colorIndicator, { backgroundColor: event.displayColor }]} />
          <Text style={styles.value}>Calendar Event</Text>

          {/* Badge for Recurring status */}
          {isRecurring && (
            <View style={[styles.badge, styles.recurringBadge]}>
              <Text style={styles.badgeText}>Recurring</Text>
            </View>
          )}
        </View>

        <View style={styles.chipRow}>
          {/* Logic for Reminders chip */}
          <Pressable style={styles.chip}>
            <Text style={styles.chipText}>
              {event.reminders.useDefault ? 'Default Reminders' : `${event.reminders.overrides?.length || 0} Custom Reminders`}
            </Text>
          </Pressable>

          <Pressable style={styles.chip}>
            <Text style={styles.chipText}>Sequence: {event.sequence}</Text>
          </Pressable>
        </View>
      </View>

      <HorizontalBar />

      {/* Section 4: Description */}
      {event.description ? (
        <>
          <View style={styles.section}>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
          <HorizontalBar />
        </>
      ) : null}

      {/* Section 5: Actions */}
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => console.log('Duplicate Event:', event.id)}
        >
          <Text style={styles.btnText}>Duplicate</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          onPress={() => console.log('Delete Request for ID:', event.id)}
        >
          <Text style={[styles.btnText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  bar: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
    width: '100%',
  },
  section: {
    paddingHorizontal: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  valueSecondary: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  badge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recurringBadge: {
    backgroundColor: '#DBEAFE', // Light blue for recurrence
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Added wrap in case text gets long
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  btn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPressed: { backgroundColor: '#E5E7EB' },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  deleteBtnPressed: { backgroundColor: '#FECACA' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  deleteText: { color: '#DC2626' },
  descriptionText: { fontSize: 16, lineHeight: 24, color: '#4B5563' },
});
