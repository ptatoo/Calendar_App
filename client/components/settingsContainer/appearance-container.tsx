import { PASTEL_COLORS } from '@/utility/constants';
import { useContext, useState } from 'react';
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
  const {
    isLoginVisible,
    setLoginVisible,
    colors,
    updateColors,
    changePalette,
    syncCacheToPalette,
    setManualCalendarColor,
    getCalendarColor,
  } = useContext(UIContext);

  changePalette(0, 'pastel colors', PASTEL_COLORS);

  return (
    <Pressable
      onPress={() => setActiveTheme(index)}
      style={({ pressed }) => [styles.segment, isActive && styles.activeSegment, pressed && styles.pressedSegment]}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>{option}</Text>
    </Pressable>
  );
};

export default function AppearanceContainer() {
  const themeOptions = ['Light', 'Dark', 'Auto'];
  const [activeTheme, setActiveTheme] = useState(0);

  // Main Source of Truth
  const [palettes, setPalettes] = useState([
    { id: 1, name: 'Default Blue', colors: ['#2563EB', '#60A5FA', '#DBEAFE'] },
    { id: 2, name: 'Sunset', colors: ['#F59E0B', '#EF4444', '#FEE2E2'] },
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // UI States
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pickingColorIndex, setPickingColorIndex] = useState<number | null>(null);

  // --- temporary state ---
  // hold colors while editing
  const [tempColors, setTempColors] = useState<string[]>([]);

  const presetColors = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#000000', '#6B7280'];

  // Start Editing: Copy real colors into the sandbox
  const handleModify = () => {
    setTempColors([...palettes[selectedIndex].colors]);
    setIsEditing(true);
  };

  // Save: Push sandbox colors into the main state
  const handleSave = () => {
    const updatedPalettes = [...palettes];
    updatedPalettes[selectedIndex].colors = [...tempColors];
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
      id: Date.now(),
      name: type === 'blank' ? 'Custom Palette' : 'Generated Palette',
      colors: newColors,
    };
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
  const displayColors = isEditing ? tempColors : palettes[selectedIndex].colors;

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Theme</Text>
      <View style={styles.themeContainer}>
        {themeOptions.map((option, index) => (
          <ThemeButton key={option} option={option} index={index} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        ))}
      </View>

      <View style={styles.rowHeader}>
        <Text style={styles.headerText}>Color & Appearance</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ New Palette</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.paletteDisplayCard, isEditing && styles.editingCard]}>
        <View style={styles.paletteInfo}>
          <Text style={styles.paletteNameText}>
            {isEditing ? `Editing: ${palettes[selectedIndex].name}` : palettes[selectedIndex].name}
          </Text>
          <View style={styles.colorPreviewRow}>
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

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {isEditing && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.modifyButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.modifyButton, isEditing && styles.saveButton]} onPress={isEditing ? handleSave : handleModify}>
            <Text style={[styles.modifyButtonText, isEditing && styles.saveButtonText]}>{isEditing ? 'Save' : 'Modify'}</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      {/* modal logic */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  headerText: { fontSize: 15, color: '#000', fontWeight: '600', paddingBottom: 10 },
  themeContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 4, height: 35, marginBottom: 20 },
  segment: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  activeSegment: { backgroundColor: '#FFF', elevation: 3, shadowOpacity: 0.1 },
  pressedSegment: { opacity: 0.7 },
  text: { fontSize: 12, color: '#6B7280' },
  activeText: { color: '#111827', fontWeight: '700' },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addButton: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: '#4F46E5' },
  paletteDisplayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  editingCard: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  paletteInfo: { flex: 1 },
  paletteNameText: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 10 },
  colorPreviewRow: { flexDirection: 'row' },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeColorCircle: { borderColor: '#4F46E5', transform: [{ scale: 1.1 }] },
  editIconDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  modifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'transparent' },
  saveButton: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  modifyButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  saveButtonText: { color: '#FFF' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionText: { fontSize: 16, color: '#1F2937' },
  modalCancel: { marginTop: 15, alignItems: 'center' },
});
