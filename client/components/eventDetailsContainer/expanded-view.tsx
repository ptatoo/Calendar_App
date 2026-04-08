import { getEventTimeDisplay } from '@/utility/eventUtils';
import { EventObj } from '@/utility/types';
import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EventsContext } from '../contexts/calendar-events-context';

interface ExpandedViewProps {
  initialEvent: EventObj;
}

const HorizontalBar = () => <View style={styles.bar} />;

export const EventExpandedView = ({ initialEvent }: ExpandedViewProps) => {
  const { createEvent, editEvent } = useContext(EventsContext);
  const [event, setEvent] = useState<EventObj>(initialEvent);

  const updateField = (field: keyof EventObj, value: string) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  const mode = () => {
    switch(event.id){
      case "draft":
        return "create";
      default:
        return "edit";
    }
  }

  // Logic to check if this is a recurring instance
  const isRecurring = !!event.recurringEventId || (event.recurrence && event.recurrence.length > 0);

  const duplicateEvent = () => {
    createEvent(event);
  }

  const { primary, secondary } = getEventTimeDisplay(event);

  return (
    <View style={styles.container}>
      {/* --- TITLE (Editable) --- */}
      <TextInput 
        style={styles.title} 
        value={event.title}
        onChangeText={(text) => updateField('title', text)}
        placeholder="Event Title" 
      />
      
      {/* --- HOURS & DATE (Read-only without a DatePicker) --- */}
      <Text style={styles.timeRow}>{primary}</Text>
      <Text style={styles.dateRow}>{secondary}</Text>

      <HorizontalBar />

      {/* Section 1: People (Read-only from Google) */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Organizer:</Text>
          <Text style={styles.value}>{event.organizer}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{event.eventType}</Text>
        </View>
      </View>

      <HorizontalBar />

      {/* Section 2: Location (Editable) */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <TextInput 
            style={[styles.value, styles.input]} 
            value={event.location} 
            onChangeText={(text) => updateField('location', text)}
            placeholder="No location provided"
          />
        </View>
      </View>

      <HorizontalBar />

      {/* Section 3: Description (Editable) */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <TextInput 
            style={styles.descriptionText} 
            value={event.description} 
            onChangeText={(text) => updateField('description', text)} 
            placeholder="No description"
            multiline 
          />
        </View>
      </View>

      <HorizontalBar />

      {/* Section 4: Calendar & Series Status (Read-only) */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={[styles.colorIndicator, { backgroundColor: event.displayColor }]} />
          <Text style={styles.value}>Calendar Event</Text>

          {isRecurring && (
            <View style={[styles.badge, styles.recurringBadge]}>
              <Text style={styles.badgeText}>Recurring</Text>
            </View>
          )}
        </View>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {event.reminders.useDefault ? 'Default Reminders' : `${event.reminders.overrides?.length || 0} Custom Reminders`}
            </Text>
          </View>
        </View>
      </View>

      <HorizontalBar />

      {/* Section 5: Actions */}
      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={duplicateEvent}
        >
          <Text style={styles.btnText}>Duplicate</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => editEvent(event)}
        >
          <Text style={styles.btnText}>Save</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          onPress={() => console.log('Deleted')}
        >
          <Text style={[styles.btnText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  label: { fontSize: 16, color: '#8b8e94', width: 85 },
  section: { paddingHorizontal: 4 },
  value: { fontSize: 16, color: '#111827', fontWeight: '500' },
  input: { flex: 1, padding: 0 }, // Removes Android default padding on TextInputs
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }, // Align to top for multiline
  colorIndicator: { width: 12, height: 12, borderRadius: 6, alignSelf: 'center' },
  badge: { backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'center' },
  recurringBadge: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1E40AF' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  chipText: { fontSize: 13, color: '#4B5563' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 40, marginTop: 16 },
  btn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, padding: 0 },
  timeRow: { fontSize: 18, color: '#374151', fontWeight: '500', lineHeight: 24 },
  dateRow: { fontSize: 16, color: '#6B7280', marginTop: 2 },
  btnPressed: { backgroundColor: '#E5E7EB' },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  deleteBtnPressed: { backgroundColor: '#FECACA' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  deleteText: { color: '#DC2626' },
  descriptionText: { flex: 1, fontSize: 16, color: '#4B5563', padding: 0, textAlignVertical: 'top', minHeight: 40 },
});