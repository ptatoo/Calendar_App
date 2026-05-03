//TODO:
// 1. potentailly display multiple colorCaches and be able to select one to display
// 2. maybe when the user saves their modifications the app automatically removes any repeats and orders them (somehow)
// 3. when adding a new color palette, have some preset options shown
// 4. when modifying a pallete, a user can remove and add colors

import { lightenColor } from '@/utility/eventUtils';
import { globalStyles } from '@/utility/globalStyles';
import { COLORS } from '@/utility/theme';
import { colorCache } from '@/utility/types';
import { useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UIContext } from '../contexts/ui-context';

const ThemeButton = ({
  option,
  index,
  activeTheme,
  setActiveTheme,
}: {
  option: string;
  index: number;
  activeTheme: number;
  setActiveTheme: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const isActive = activeTheme === index;

  return (
    <Pressable
      onPress={() => setActiveTheme(index)}
      style={({ pressed }) => [
        globalStyles.toggleButtonSegment,
        isActive && globalStyles.toggleButtonActiveSegement,
        pressed && globalStyles.pressedButton,
      ]}
    >
      <Text style={[globalStyles.smallButtonText, isActive && globalStyles.activeSmallButtonText]}>{option}</Text>
    </Pressable>
  );
};

export default function AppearanceContainer() {
  const { allCaches, activeCacheId, syncCacheToPalette } = useContext(UIContext);

  //Themes (light, dark, auto)
  const themeOptions = ['Light', 'Dark', 'Auto'];
  const [activeTheme, setActiveTheme] = useState(0);

  // Palettes and palette ID's
  const [palettes, setPalettes] = useState(allCaches);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // UI States
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pickingColorIndex, setPickingColorIndex] = useState<number | null>(null);
  const [isDebug, setDebug] = useState<boolean>(true);

  // --- temporary state ---
  // hold colors while editing
  const [tempColors, setTempColors] = useState<string[]>([]);

  const presetColors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#000000', '#6B7280'];

  // Start Editing: Copy real colors into the sandbox
  const handleModify = () => {
    setTempColors([...palettes[selectedIndex].palette]);
    setIsEditing(true);
  };

  // Save: Push sandbox colors into the main state
  const handleSave = () => {
    const updatedPalettes = [...palettes];
    updatedPalettes[selectedIndex].palette = [...tempColors];
    syncCacheToPalette(tempColors);
    setPalettes(updatedPalettes);
    setIsEditing(false);
    setPickingColorIndex(null);
  };

  // Cancel: Throw away sandbox changes
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPickingColorIndex(null);
  };

  const addNewPalette = (type: 'generated' | 'blank') => {
    const newColors = type === 'blank' ? ['#D1D5DB', '#E5E7EB', '#F3F4F6'] : ['#8B5CF6', '#C4B5FD', '#EDE9FE'];
    const newPalette = {
      paletteId: Date.now(),
      name: type === 'blank' ? 'Custom Palette' : 'Generated Palette',
      palette: newColors,
    } as colorCache;
    const newList = [...palettes, newPalette];
    setPalettes(newList);
    setSelectedIndex(newList.length - 1);
    setModalVisible(false);

    // Automatically open edit mode for the new palette
    setTempColors([...newColors]);
    setIsEditing(true);
  };

  const updateTempColor = (newColor: string) => {
    if (pickingColorIndex !== null) {
      const newTemp = [...tempColors];
      newTemp[pickingColorIndex] = newColor;
      setTempColors(newTemp);
    }
  };

  // Decide which colors to display: Real ones or Temp ones
  const displayColors = isEditing ? tempColors : palettes[selectedIndex].palette;

  //temp
  const rawColors = useMemo(() => {
    const c = allCaches[activeCacheId];
    const output: string[] = [];
    c.palette.map((color, index) => {
      output.push(color);
    });
    return output;
  }, [allCaches, activeCacheId]);
  const colors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color, index) => {
      output2.push(lightenColor(color, 50, 20));
    });
    return output2;
  }, [rawColors]);
  const textColors = useMemo(() => {
    const output2: string[] = [];
    rawColors.map((color, index) => {
      output2.push(lightenColor(color, 90, -40));
    });
    return output2;
  }, [rawColors]);

  return (
    <View style={styles.container}>
      {/* -- Theme Editor --- */}
      <View style={globalStyles.rowHeader}>
        <Text style={globalStyles.headerText}>Theme</Text>
      </View>
      <View style={globalStyles.toggleButtonContainer}>
        {themeOptions.map((option, index) => (
          <ThemeButton key={option} option={option} index={index} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        ))}
      </View>

      {/* -- Color Palette Editor --- */}
      <View style={globalStyles.rowHeader}>
        <Text style={globalStyles.headerText}>Color & Appearance</Text>
        {/* -- Add Palette Button --- */}
        <Pressable style={({ pressed }) => [styles.addButton, pressed && globalStyles.pressedButton]} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New Palette</Text>
        </Pressable>
      </View>

      {/* -- Palette Display --- */}
      <View style={[styles.paletteDisplayCard, styles.paletteInfo, isEditing && styles.editingCard]}>
        {/* -- Palette Header --- */}
        <View style={styles.rowHeader}>
          {/* -- Palette Title --- */}
          <Text style={styles.paletteNameText}>
            {isEditing ? `Editing: ${palettes[selectedIndex].name}` : palettes[selectedIndex].name}
          </Text>
          {/* -- Palette Modify, Cancel, Save --- */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.modifyButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton]} onPress={handleSave}>
                  <Text style={[styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.modifyButton]} onPress={handleModify}>
                <Text style={[styles.modifyButtonText]}>Modify</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* -- Palette Color Map --- */}
        <View style={styles.colorPreviewFlex}>
          {displayColors.map((color, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => isEditing && setPickingColorIndex(i)}
              style={[styles.colorCircle, { backgroundColor: color }, isEditing && pickingColorIndex === i && styles.activeColorCircle]}
            >
              {isEditing && <View style={styles.editIconDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* -- Live Preview Picker --- */}
      {isEditing && pickingColorIndex !== null && (
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Live Preview Picker:</Text>
          <View style={styles.presetGrid}>
            {presetColors.map((c) => (
              <TouchableOpacity key={c} style={[styles.presetCircle, { backgroundColor: c }]} onPress={() => updateTempColor(c)} />
            ))}
          </View>
          <TextInput
            style={styles.hexInput}
            value={tempColors[pickingColorIndex]}
            onChangeText={updateTempColor}
            placeholder="#000000"
            maxLength={7}
          />
        </View>
      )}

      <Text style={styles.headerText}>EventBlock</Text>
      <Text style={styles.headerText}>SideBar</Text>

      {/* --- DEBUGGER --- */}
      {isDebug === true && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' }}>
          {colors.map((color, index) => (
            <View
              style={{
                height: 50,
                width: 85,
              }}
            >
              {/* --- EVENT LEFT BAR --- */}
              <View style={[styles.event, { backgroundColor: rawColors[index], borderLeftColor: color }]}>
                {/* --- EVENT TITLE --- */}
                <Text style={[styles.eventText, { color: textColors[index] }]} numberOfLines={1}>
                  Title
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* --- New Palette Modal --- */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Palette</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => addNewPalette('generated')}>
              <Text style={styles.modalOptionText}>✨ Generate Random</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => addNewPalette('blank')}>
              <Text style={styles.modalOptionText}>⬜ Create Custom</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  text: { fontSize: 12, color: '#6B7280' },
  activeText: { color: '#111827', fontWeight: '700' },
  addButton: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryDark },
  paletteDisplayCard: {
    flexDirection: 'column',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  editingCard: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  paletteInfo: { flex: 1 },
  paletteNameText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  colorPreviewFlex: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeColorCircle: { borderColor: '#4F46E5', transform: [{ scale: 1.1 }] },
  editIconDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  //modify, cancel, save
  modifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  modifyButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  saveButtonText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
  pickerContainer: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 20 },
  pickerLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  presetCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  hexInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    textAlign: 'center',
  },
  //modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    // Shadow logic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, // Negative height pushes shadow UP
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionText: { fontSize: 16, color: '#1F2937' },
  modalCancel: { marginTop: 15, alignItems: 'center' },

  eventContainer: {
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    position: 'absolute', // Allows use of 'top'
    borderRadius: 4,
  },
  event: {
    flex: 1,
    borderLeftWidth: 6,
    borderRadius: 4,
    padding: 4,
  },
  eventText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 8,
    fontWeight: '600',
    color: '#000000',
  },
});
