
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaControl IoT',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.teal,
        scaffoldBackgroundColor: const Color(0xFF121212),
        colorScheme: ColorScheme.dark(
          primary: Colors.teal,
          secondary: Colors.tealAccent,
          background: const Color(0xFF121212),
          surface: const Color(0xFF1E1E1E),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF1E1E1E),
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.teal,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E1E1E),
          elevation: 0, 
        ),
      ),
      home: const LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController(text: 'a@h.cl');
  final _passwordController = TextEditingController(text: '123456');

  Future<void> _login() async {
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text,
        password: _passwordController.text,
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const HomePage()),
      );
    } on FirebaseAuthException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.message ?? 'Login failed'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('AquaControl IoT', style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: Colors.tealAccent)),
                const SizedBox(height: 48.0),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 16.0),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 32.0),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _login,
                    style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                    child: const Text('Login'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final DatabaseReference _counterRef = FirebaseDatabase.instance.ref('esp32/counter');
  final DatabaseReference _ledStatusRef = FirebaseDatabase.instance.ref('esp32/led_status');

  Future<void> _logout() async {
    await FirebaseAuth.instance.signOut();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
  }

  Future<void> _toggleLed(bool value) async {
    await _ledStatusRef.set(value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel de Control'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            // Counter Card
            _buildInfoCard(
              context: context,
              icon: Icons.timer,
              title: 'Contador del Dispositivo',
              stream: _counterRef.onValue,
              dataBuilder: (snapshot) => '${snapshot.data!.snapshot.value}',
            ),
            const SizedBox(height: 20),
            
            // LED Control Card
            _buildControlCard(
              context: context,
              icon: Icons.lightbulb_outline,
              title: 'Control de Bomba',
              stream: _ledStatusRef.onValue,
              onChanged: _toggleLed,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Stream<DatabaseEvent> stream,
    required String Function(AsyncSnapshot<DatabaseEvent> snapshot) dataBuilder,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              children: [
                Icon(icon, size: 28, color: Colors.tealAccent),
                const SizedBox(width: 16),
                Text(title, style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 16),
            StreamBuilder<DatabaseEvent>(
              stream: stream,
              builder: (context, snapshot) {
                if (snapshot.hasError) return const Text('Error', style: TextStyle(color: Colors.redAccent));
                if (!snapshot.hasData || snapshot.data!.snapshot.value == null) return const Text('--', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold));
                return Text(
                  dataBuilder(snapshot),
                  style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Stream<DatabaseEvent> stream,
    required ValueChanged<bool> onChanged,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, size: 28, color: Colors.tealAccent),
                const SizedBox(width: 16),
                Text(title, style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            StreamBuilder<DatabaseEvent>(
              stream: stream,
              builder: (context, snapshot) {
                bool currentValue = false;
                if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
                  currentValue = snapshot.data!.snapshot.value as bool;
                } else if (!snapshot.hasData) {
                   // Set an initial value if it doesn't exist
                  onChanged(false);
                }

                return Switch(
                  value: currentValue,
                  onChanged: onChanged,
                  activeColor: Colors.tealAccent,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
