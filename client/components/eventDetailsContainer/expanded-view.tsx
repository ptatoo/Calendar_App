import { getEventTimeDisplay } from '@/utility/eventUtils';
import { EventObj } from '@/utility/types';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { EventsContext } from '../contexts/calendar-events-context';

interface ExpandedViewProps {
  initialEvent: EventObj;
}

const HorizontalBar = () => <View style={styles.bar} />;

export const EventExpandedView = ({ initialEvent }: ExpandedViewProps) => {
  const { deleteEvent, createEvent, editEvent } = useContext(EventsContext);
  const [event, setEvent] = useState<EventObj>(initialEvent);

  // Sync the state when the initialEvent prop changes
  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  const updateField = (field: keyof EventObj, value: any) => {
    setEvent((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllDay = (value: boolean) => {
    updateField('allDay', value); 
  };

  // Simplified Recurrence Picker Logic
  const cycleRecurrence = () => {
    const options = [
      null, 
      ['RRULE:FREQ=DAILY'], 
      ['RRULE:FREQ=WEEKLY'], 
      ['RRULE:FREQ=MONTHLY']
    ];
    const currentIdx = options.findIndex(opt => JSON.stringify(opt) === JSON.stringify(event.recurrence));
    const nextIdx = (currentIdx + 1) % options.length;
    updateField('recurrence', options[nextIdx]);
  };

  const getRecurrenceLabel = () => {
    if (!event.recurrence || event.recurrence.length === 0) return "Does not repeat";
    const rrule = event.recurrence[0];
    if (rrule.includes("DAILY")) return "Every day";
    if (rrule.includes("WEEKLY")) return "Every week";
    if (rrule.includes("MONTHLY")) return "Every month";
    return "Custom repeat";
  };

  const { primary, secondary } = getEventTimeDisplay(event);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* TITLE */}
      <TextInput 
        style={styles.title} 
        value={event.title}
        onChangeText={(text) => updateField('title', text)}
        placeholder="New Event" 
        placeholderTextColor="#c9c8c6"
      />

      {/* TIME BLOCK */}
      <View style={styles.timeSection}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeRow}>{primary}</Text>
            <Text style={styles.dateRow}>{secondary}</Text>
            <Text style={styles.dateRow}>{event.calendarId}</Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={styles.iconCol}><Text style={styles.icon}>🌓</Text></View>
          <Text style={styles.primaryText}>All-day</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Switch 
              value={event.allDay} 
              onValueChange={toggleAllDay}
              trackColor={{ false: "#e1e1de", true: "#2383e2" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#e1e1de"
            />
          </View>
        </View>

        <Pressable style={[styles.row, { marginTop: 12 }]} onPress={cycleRecurrence}>
          <View style={styles.iconCol}><Text style={styles.icon}>🔁</Text></View>
          <Text style={styles.primaryText}>{getRecurrenceLabel()}</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
             <Text style={styles.chevron}>〉</Text>
          </View>
        </Pressable>
      </View>

      <HorizontalBar />

      {/* PROPERTIES BLOCK */}
      <View style={styles.listBlock}>
        <View style={styles.row}>
          <View style={styles.iconCol}><Text style={styles.icon}>📍</Text></View>
          <TextInput 
            style={styles.input} 
            value={event.location} 
            onChangeText={(text) => updateField('location', text)}
            placeholder="Location"
            placeholderTextColor="#c9c8c6"
          />
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={styles.iconCol}>
            <View style={[styles.colorSquare, { backgroundColor: event.calendar?.calendarCustomColor || '#3B82F6' }]} />
          </View>
          <Text style={styles.primaryText} numberOfLines={1}>{event.organizer}</Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={styles.iconCol}><Text style={styles.icon}>🔔</Text></View>
          <Text style={styles.secondaryText}>
            {event.reminders.useDefault ? 'Default Reminders' : `${event.reminders.overrides?.length || 0} Custom Reminders`}
          </Text>
        </View>
      </View>

      <HorizontalBar />

      {/* DESCRIPTION BLOCK */}
      <View style={styles.descBlock}>
        <TextInput 
          style={styles.descriptionInput} 
          value={event.description} 
          onChangeText={(text) => updateField('description', text)} 
          placeholder="Add description..."
          placeholderTextColor="#c9c8c6"
          multiline 
        />
      </View>

      <HorizontalBar />

      {/* ACTIONS */}
      <View style={styles.actionBlock}>
        {
        event.id ? ( 
          <Pressable style={({ pressed }) => [styles.btn, styles.primaryBtn, pressed && styles.primaryBtnPressed]} onPress={() => editEvent(event)}>
            <Text style={styles.primaryBtnText}>Save Changes</Text>
          </Pressable>
        ) : (null)
    }
        
        <View style={styles.actionRowHalf}>
          <Pressable style={({ pressed }) => [styles.btn, styles.secondaryBtn, pressed && styles.btnPressed]} onPress={() => createEvent(event)}>
            <Text style={styles.secondaryBtnText}>{event.id ? 'Duplicate' : 'Create Event'}</Text>
          </Pressable>
          {
          event.id ? ( 
            <Pressable style={({ pressed }) => [styles.btn, styles.secondaryBtn, pressed && styles.btnPressed]} onPress={() => deleteEvent(event)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          ) : (null)
          }
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  bar: { height: 1, backgroundColor: '#ededed', marginVertical: 12 },
  
  // Title
  title: { fontSize: 28, fontWeight: '700', color: '#37352f', padding: 0, marginBottom: 0 },
  
  // Time Section
  timeSection: { marginVertical: 2 },
  timeRow: { fontSize: 18, color: '#374151', fontWeight: '500', lineHeight: 24 },
  dateRow: { fontSize: 16, color: '#6B7280', marginTop: 2, marginBottom: 16 },

  // Layout & Rows
  listBlock: { marginVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 24 },
  iconCol: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
  icon: { fontSize: 18, color: '#787774' },
  chevron: { fontSize: 14, color: '#c9c8c6', fontWeight: '600' },
  colorSquare: { width: 14, height: 14, borderRadius: 3 },
  
  // Typography
  primaryText: { fontSize: 15, color: '#37352f', fontWeight: '400' },
  secondaryText: { fontSize: 15, color: '#787774', fontWeight: '400' },
  input: { flex: 1, fontSize: 15, color: '#37352f', padding: 0, fontWeight: '400' },
  
  // Description Area
  descBlock: { marginVertical: 8, minHeight: 150 },
  descriptionInput: { flex: 1, fontSize: 15, color: '#37352f', padding: 0, textAlignVertical: 'top', lineHeight: 22 },

  // Buttons
  actionBlock: { marginTop: 20, gap: 10 },
  actionRowHalf: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { backgroundColor: '#2383e2' },
  primaryBtnPressed: { backgroundColor: '#1d6ebc' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  secondaryBtn: { backgroundColor: '#f1f1ef', borderColor: '#e1e1de' },
  btnPressed: { backgroundColor: '#e1e1de' },
  secondaryBtnText: { fontSize: 14, fontWeight: '500', color: '#37352f' },
  deleteText: { fontSize: 14, fontWeight: '500', color: '#eb5757' },
});