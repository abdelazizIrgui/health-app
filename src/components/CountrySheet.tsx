import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import { Country, countryName, searchCountries } from '../utils/countries';
import BottomSheet from './BottomSheet';

interface Props {
  visible: boolean;
  selected: string; // ISO code
  onSelect: (country: Country) => void;
  onClose: () => void;
}

/** Searchable list of all countries with their calling codes. */
export default function CountrySheet({ visible, selected, onSelect, onClose }: Props) {
  const { t, dir, language } = useI18n();
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const data = useMemo(() => searchCountries(query, language), [query, language]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} title={t('register.country')} onClose={close}>
      <View style={[styles.search, { flexDirection: dir.row }]}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { textAlign: dir.align }]}
          placeholder={t('register.searchCountry')}
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
      <FlatList
        style={{ height: height * 0.5 }}
        data={data}
        keyExtractor={(c) => c.iso}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        ListEmptyComponent={<Text style={styles.empty}>{t('register.noCountry')}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.option, { flexDirection: dir.row }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: item.iso === selected }}
            onPress={() => {
              setQuery('');
              onSelect(item);
            }}
          >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={[styles.name, { textAlign: dir.align }]} numberOfLines={1}>
              {countryName(item, language)}
            </Text>
            <Text style={styles.dial}>+{item.dial}</Text>
            {item.iso === selected && (
              <Ionicons name="checkmark-circle" size={20} color={colors.rose} />
            )}
          </TouchableOpacity>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  search: {
    alignItems: 'center',
    gap: 8,
    height: 46,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(44, 37, 45, 0.08)',
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.text },
  option: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 37, 45, 0.12)',
  },
  flag: { fontSize: 24 },
  name: { flex: 1, fontSize: 16, color: colors.text },
  dial: { fontSize: 15, color: colors.muted },
  empty: { marginTop: 24, textAlign: 'center', color: colors.muted },
});