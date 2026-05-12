import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

const images = [
  require('../public/banner/basilica-del-voto-nacional-quito.jpg'),
  require('../public/banner/Chimborazo.jpg'),
  require('../public/banner/el-cisne-church.jpg'),
  require('../public/banner/Mitad del mundo.jpg'),
  require('../public/banner/Pailon-del-Diablo_Cover.jpg'),
  require('../public/banner/pinaculoislabartolome.jpg'),
  require('../public/banner/PuertaCiudadLoja.jpg'),
  require('../public/banner/quillotoa.jpg'),
  require('../public/banner/salinas.jpg'),
];

export default function CollageScreen({ onContinue }) {
  const gridAnim     = useRef(new Animated.Value(0)).current;
  const badgeAnim    = useRef(new Animated.Value(0)).current;
  const titleAnim    = useRef(new Animated.Value(0)).current;
  const lineAnim     = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim  = useRef(new Animated.Value(0)).current;
  const buttonAnim   = useRef(new Animated.Value(0)).current;

  const pulseAnim     = useRef(new Animated.Value(1)).current;
  const shimmerAnim   = useRef(new Animated.Value(-1)).current;
  const titleGlowAnim = useRef(new Animated.Value(1)).current;

  const makeEntry = (anim) =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

  useEffect(() => {
    // Entrada escalonada
    Animated.sequence([
      Animated.timing(gridAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.stagger(160, [
        makeEntry(badgeAnim),
        makeEntry(titleAnim),
        makeEntry(lineAnim),
        makeEntry(subtitleAnim),
        makeEntry(taglineAnim),
        makeEntry(buttonAnim),
      ]),
    ]).start();

    // Pulso infinito en el botón
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 850, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Shimmer deslizante infinito en el título
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 2800,
        delay: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Glow pulsante infinito en el título
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleGlowAnim, { toValue: 0.6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(titleGlowAnim, { toValue: 1,   duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const entryStyle = (anim, fromY = 28) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }),
    }],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-width * 0.7, width * 0.7],
  });

  return (
    <View style={styles.container}>
      {/* ── Grid de imágenes ── */}
      <Animated.View style={[styles.gridContainer, { opacity: gridAnim }]}>
        {images.map((img, index) => (
          <Image key={index} source={img} style={styles.imageItem} resizeMode="cover" />
        ))}
      </Animated.View>

      {/* ── Overlay ── */}
      <View style={styles.overlay}>

        {/* Badge superior */}
        <Animated.View style={[styles.badgeWrap, entryStyle(badgeAnim, -18)]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🇪🇨  GUÍA DE LUGARES DE INTERÉS</Text>
          </View>
        </Animated.View>

        {/* Bloque central */}
        <View style={styles.centerBlock}>

          {/* Título con shimmer + glow */}
          <Animated.View style={[styles.titleWrap, entryStyle(titleAnim)]}>
            <Animated.Text style={[styles.title, { opacity: titleGlowAnim }]}>
              Ecuador{'\n'}en tus Manos
            </Animated.Text>
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }, { skewX: '-18deg' }] },
              ]}
            />
          </Animated.View>

          {/* Línea decorativa */}
          <Animated.View style={[entryStyle(lineAnim, 0), { alignItems: 'center' }]}>
            <View style={styles.decorLine}>
              <View style={styles.lineSide} />
              <View style={styles.lineDot} />
              <View style={styles.lineSide} />
            </View>
          </Animated.View>

          {/* Subtítulo */}
          <Animated.Text style={[styles.subtitle, entryStyle(subtitleAnim)]}>
            Miles de destinos, una sola app. Descubre nuestro Ecuador en un solo lugar.
          </Animated.Text>

        </View>

        {/* Bloque inferior */}
        <View style={styles.bottomBlock}>
          <Animated.Text style={[styles.tagline, entryStyle(taglineAnim)]}>
            Explora · Descubre · Vive Ecuador
          </Animated.Text>

          <Animated.View style={[entryStyle(buttonAnim), { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity style={styles.button} onPress={onContinue} activeOpacity={0.85}>
              <View style={styles.buttonShine} />
              <Text style={styles.buttonText}>Empezar a Explorar</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text style={[styles.hint, entryStyle(buttonAnim)]}>
            Gratis · Sin registro previo
          </Animated.Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* ── Grid ── */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width,
    height,
    position: 'absolute',
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: height / 3,
  },

  /* ── Overlay ── */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 44,
    paddingHorizontal: 24,
  },

  /* ── Badge ── */
  badgeWrap: { width: '100%', alignItems: 'center' },
  badge: {
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.55)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,215,0,0.10)',
  },
  badgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  /* ── Bloque central ── */
  centerBlock: {
    alignItems: 'center',
    gap: 16,
  },

  /* ── Título + shimmer ── */
  titleWrap: {
    overflow: 'hidden',
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 58,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 4,
  },

  /* ── Línea decorativa ── */
  decorLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  lineSide: {
    width: 48,
    height: 1.5,
    backgroundColor: '#FFD700',
    opacity: 0.75,
  },
  lineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },

  /* ── Subtítulo ── */
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
    maxWidth: 300,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  /* ── Bloque inferior ── */
  bottomBlock: {
    alignItems: 'center',
    gap: 14,
  },
  tagline: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  /* ── Botón ── */
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 17,
    paddingHorizontal: 44,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  /* ── Hint ── */
  hint: {
    color: 'rgba(255,255,255,0.40)',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});