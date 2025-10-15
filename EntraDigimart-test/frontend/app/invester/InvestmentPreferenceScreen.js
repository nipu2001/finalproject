import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { investorAPI } from '../../api';

const InvestmentPreferenceScreen = () => {
  const router = useRouter();
  const [minInvestment, setMinInvestment] = useState('');
  const [maxInvestment, setMaxInvestment] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [riskLevel, setRiskLevel] = useState('Moderate');

  const categories = [
    { name: 'Textile', icon: 'shirt', color: ['#22c55e', '#16a34a'] },
    { name: 'Spices', icon: 'leaf', color: ['#f59e0b', '#d97706'] },
    { name: 'Handicrafts', icon: 'color-palette', color: ['#8b5cf6', '#7c3aed'] },
    { name: 'Pottery', icon: 'flask', color: ['#ef4444', '#dc2626'] },
    { name: 'Jewelry', icon: 'diamond', color: ['#3b82f6', '#2563eb'] },
    { name: 'Food', icon: 'fast-food', color: ['#10b981', '#059669'] },
  ];
  const regions = [
    { name: 'Kandy', icon: 'location' },
    { name: 'Colombo', icon: 'location' },
    { name: 'Matale', icon: 'location' },
    { name: 'Galle', icon: 'location' },
    { name: 'Ratnapura', icon: 'location' },
    { name: 'Jaffna', icon: 'location' },
  ];

  const riskLevels = [
    { name: 'Conservative', icon: 'shield-checkmark', color: ['#22c55e', '#16a34a'], desc: 'Low risk, stable returns' },
    { name: 'Moderate', icon: 'speedometer', color: ['#3b82f6', '#2563eb'], desc: 'Balanced risk-reward' },
    { name: 'Aggressive', icon: 'flame', color: ['#ef4444', '#dc2626'], desc: 'High risk, high potential' },
  ];

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleRegion = (region) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const prefs = await investorAPI.getPreferences();
        if (prefs) {
          setMinInvestment(toStr(prefs.minAmount));
          setMaxInvestment(toStr(prefs.maxAmount));
          setSelectedCategories(splitCsv(prefs.industries));
          setSelectedRegions(splitCsv(prefs.regions));
          setRiskLevel(fromBackendRisk(prefs.riskLevel));
        }
      } catch (_) {
        // no saved prefs yet
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        minAmount: numOrNull(minInvestment),
        maxAmount: numOrNull(maxInvestment),
        industries: selectedCategories.join(','),
        regions: selectedRegions.join(','),
        riskLevel: toBackendRisk(riskLevel),
        preferredEquityMin: null,
        preferredEquityMax: null,
      };
      const res = await investorAPI.savePreferences(payload);
      const p = res?.preferences || {};
      setMinInvestment(toStr(p.minAmount));
      setMaxInvestment(toStr(p.maxAmount));
      setSelectedCategories(splitCsv(p.industries));
      setSelectedRegions(splitCsv(p.regions));
      setRiskLevel(fromBackendRisk(p.riskLevel));
      Alert.alert('Success', 'Investment preferences saved successfully!');
    } catch (e) {
      Alert.alert('Error', e?.error || 'Failed to save preferences');
    }
  };

  const CategoryChip = ({ name, icon, color, selected }) => (
    <TouchableOpacity 
      onPress={() => toggleCategory(name)}
      style={styles.chipContainer}
    >
      {selected ? (
        <LinearGradient
          colors={color}
          style={styles.chip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={16} color="white" />
          <Text style={styles.chipTextActive}>{name}</Text>
          <Ionicons name="checkmark-circle" size={16} color="white" />
        </LinearGradient>
      ) : (
        <View style={styles.chipInactive}>
          <Ionicons name={icon} size={16} color="#64748b" />
          <Text style={styles.chipTextInactive}>{name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const RegionChip = ({ name, icon, selected }) => (
    <TouchableOpacity 
      onPress={() => toggleRegion(name)}
      style={styles.chipContainer}
    >
      {selected ? (
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.chip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={16} color="white" />
          <Text style={styles.chipTextActive}>{name}</Text>
          <Ionicons name="checkmark-circle" size={16} color="white" />
        </LinearGradient>
      ) : (
        <View style={styles.chipInactive}>
          <Ionicons name={icon} size={16} color="#64748b" />
          <Text style={styles.chipTextInactive}>{name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const RiskCard = ({ name, icon, color, desc, selected }) => (
    <TouchableOpacity 
      onPress={() => setRiskLevel(name)}
      style={styles.riskCardContainer}
    >
      {selected ? (
        <LinearGradient
          colors={color}
          style={styles.riskCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={32} color="white" />
          <Text style={styles.riskCardTitle}>{name}</Text>
          <Text style={styles.riskCardDesc}>{desc}</Text>
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.riskCardInactive}>
          <Ionicons name={icon} size={32} color="#64748b" />
          <Text style={styles.riskCardTitleInactive}>{name}</Text>
          <Text style={styles.riskCardDescInactive}>{desc}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#22c55e', '#3b82f6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Investment Preferences</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Investment Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Investment Range</Text>
          </View>
          <View style={styles.rangeCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Minimum Amount (LKR)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={minInvestment}
                  onChangeText={setMinInvestment}
                  keyboardType="numeric"
                  placeholder="1,000,000"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Maximum Amount (LKR)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  value={maxInvestment}
                  onChangeText={setMaxInvestment}
                  keyboardType="numeric"
                  placeholder="10,000,000"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Business Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Business Categories</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select the industries you're interested in</Text>
          <View style={styles.chipsContainer}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.name}
                name={cat.name}
                icon={cat.icon}
                color={cat.color}
                selected={selectedCategories.includes(cat.name)}
              />
            ))}
          </View>
        </View>

        {/* Preferred Regions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Preferred Regions</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Choose regions you want to invest in</Text>
          <View style={styles.chipsContainer}>
            {regions.map((region) => (
              <RegionChip
                key={region.name}
                name={region.name}
                icon={region.icon}
                selected={selectedRegions.includes(region.name)}
              />
            ))}
          </View>
        </View>

        {/* Risk Tolerance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="speedometer" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Risk Tolerance</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select your investment risk appetite</Text>
          <View style={styles.riskCardsContainer}>
            {riskLevels.map((risk) => (
              <RiskCard
                key={risk.name}
                name={risk.name}
                icon={risk.icon}
                color={risk.color}
                desc={risk.desc}
                selected={riskLevel === risk.name}
              />
            ))}
          </View>
        </View>

        {/* Expected Returns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Expected Annual Returns</Text>
          </View>
          <View style={styles.returnsCard}>
            <View style={styles.returnOption}>
              <View style={styles.returnLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={styles.returnText}>15% - 20%</Text>
              </View>
              <Ionicons name="radio-button-on" size={24} color="#3b82f6" />
            </View>
            <View style={styles.returnOption}>
              <View style={styles.returnLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                <Text style={styles.returnText}>20% - 25%</Text>
              </View>
              <Ionicons name="radio-button-off" size={24} color="#cbd5e1" />
            </View>
            <View style={styles.returnOption}>
              <View style={styles.returnLeft}>
                <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
                <Text style={styles.returnText}>25% - 30%</Text>
              </View>
              <Ionicons name="radio-button-off" size={24} color="#cbd5e1" />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButtonContainer}>
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.saveButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Preferences</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', flex: 1, textAlign: 'center' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginLeft: 8 },
  sectionSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 15 },
  rangeCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e5e7eb' },
  input: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16, color: '#1e293b' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chipContainer: { marginRight: 10, marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
  chipInactive: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' },
  chipTextActive: { color: 'white', fontSize: 14, fontWeight: '600', marginHorizontal: 8 },
  chipTextInactive: { color: '#64748b', fontSize: 14, fontWeight: '500', marginLeft: 8 },
  riskCardsContainer: { flexDirection: 'column' },
  riskCardContainer: { marginBottom: 12 },
  riskCard: { padding: 20, borderRadius: 15, position: 'relative', minHeight: 120, justifyContent: 'center' },
  riskCardInactive: { padding: 20, borderRadius: 15, backgroundColor: 'white', borderWidth: 2, borderColor: '#e5e7eb', minHeight: 120, justifyContent: 'center' },
  riskCardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 10, marginBottom: 5 },
  riskCardTitleInactive: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 10, marginBottom: 5 },
  riskCardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  riskCardDescInactive: { fontSize: 14, color: '#64748b' },
  selectedBadge: { position: 'absolute', top: 15, right: 15 },
  returnsCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  returnOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  returnLeft: { flexDirection: 'row', alignItems: 'center' },
  returnText: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginLeft: 12 },
  saveSection: { paddingHorizontal: 20, paddingBottom: 30 },
  saveButtonContainer: { marginBottom: 12 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  cancelButton: { paddingVertical: 16, alignItems: 'center' },
  cancelButtonText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
});

function numOrNull(v) {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function splitCsv(v) {
  if (!v) return [];
  return String(v)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function toStr(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function toBackendRisk(uiRisk) {
  const map = { Conservative: 'low', Moderate: 'medium', Aggressive: 'high' };
  return map[uiRisk] || null;
}

function fromBackendRisk(apiRisk) {
  const map = { low: 'Conservative', medium: 'Moderate', high: 'Aggressive' };
  return map[apiRisk] || 'Moderate';
}

export default InvestmentPreferenceScreen;