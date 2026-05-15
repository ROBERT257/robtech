import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio Balance</Text>

      <Text style={styles.balance}>$12,450.89</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bitcoin</Text>
        <Text style={styles.cardPrice}>$64,200</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ethereum</Text>
        <Text style={styles.cardPrice}>$3,120</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    padding: 20,
    paddingTop: 60,
  },

  title: {
    color: '#aaa',
    fontSize: 18,
  },

  balance: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
  },

  card: {
    backgroundColor: '#151B2D',
    padding: 20,
    borderRadius: 18,
    marginBottom: 15,
  },

  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  cardPrice: {
    color: '#00D09E',
    fontSize: 22,
    marginTop: 10,
  },
});