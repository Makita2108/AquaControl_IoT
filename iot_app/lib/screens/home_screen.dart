
import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'dart:async';
import '../services/auth_service.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late DatabaseReference _databaseReference;
  final AuthService _authService = AuthService();

  // --- State Variables ---
  // Sensor Readings
  double _temperature = 0.0;
  double _humidity = 0.0;
  double _soilMoisture = 0.0;

  // Actuator States (read from /state)
  bool _valveState = false;
  bool _fanState = false;

  // Control Settings (read from /controls and send commands to it)
  bool _fanAutoMode = true;
  bool _fanManualCommand = false;
  bool _valveCommand = false;
  double _tempThreshold = 28.0;

  // Debouncer for the slider to avoid too many writes
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !! IMPORTANTE: Reemplaza con la URL de tu Realtime Database
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    _databaseReference = FirebaseDatabase.instance.refFromURL('YOUR_DATABASE_URL');

    // Listener for sensor readings
    _databaseReference.child('readings').onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>? ?? {};
      setState(() {
        _temperature = (data['temperature'] as num?)?.toDouble() ?? 0.0;
        _humidity = (data['humidity'] as num?)?.toDouble() ?? 0.0;
        _soilMoisture = (data['soilMoisture1'] as num?)?.toDouble() ?? 0.0;
      });
    });

    // Listener for actual actuator states
    _databaseReference.child('state').onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>? ?? {};
      setState(() {
        _valveState = data['valveState'] as bool? ?? false;
        _fanState = data['fanState'] as bool? ?? false;
      });
    });

    // Listener for control settings to keep UI in sync
    _databaseReference.child('controls').onValue.listen((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>? ?? {};
      setState(() {
        _fanAutoMode = data['fanAutoMode'] as bool? ?? true;
        _fanManualCommand = data['fanManualCommand'] as bool? ?? false;
        _valveCommand = data['valveCommand'] as bool? ?? false;
        _tempThreshold = (data['tempThreshold'] as num?)?.toDouble() ?? 28.0;
      });
    });
  }

  // --- Control Functions ---
  void _setFanAutoMode(bool isAuto) {
    _databaseReference.child('controls/fanAutoMode').set(isAuto);
  }

  void _setFanManualCommand(bool isOn) {
    _databaseReference.child('controls/fanManualCommand').set(isOn);
  }

  void _setValveCommand(bool isOn) {
    _databaseReference.child('controls/valveCommand').set(isOn);
  }

  void _setTempThreshold(double value) {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      _databaseReference.child('controls/tempThreshold').set(value);
    });
  }
  
  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AquaControl Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await _authService.signOut();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            _buildSensorCard('Temperatura', '${_temperature.toStringAsFixed(1)} °C', Icons.thermostat, Colors.orange),
            _buildSensorCard('Humedad Ambiente', '${_humidity.toStringAsFixed(1)} %', Icons.water_drop, Colors.blue),
            _buildSensorCard('Humedad del Suelo', '${_soilMoisture.toStringAsFixed(1)} %', Icons.grass, Colors.green),
            const SizedBox(height: 20),
            _buildFanControlCard(),
            _buildValveControlCard(),
            _buildThresholdCard(),
          ],
        ),
      ),
    );
  }

  // --- UI Builder Widgets ---
  Widget _buildSensorCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 4.0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: <Widget>[
            Icon(icon, size: 40.0, color: color),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: <Widget>[
                Text(title, style: Theme.of(context).textTheme.headline6),
                Text(value, style: Theme.of(context).textTheme.headline4?.copyWith(color: color, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFanControlCard() {
    return Card(
      elevation: 4.0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Control del Ventilador", style: Theme.of(context).textTheme.headline6),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Modo Automático"),
                Switch(
                  value: _fanAutoMode,
                  onChanged: _setFanAutoMode,
                ),
              ],
            ),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Icon(Icons.air, size: 40.0, color: _fanState ? Colors.cyan : Colors.grey),
                Text("Ventilador Manual", style: TextStyle(color: _fanAutoMode ? Colors.grey : Colors.black)),
                Switch(
                  value: _fanManualCommand,
                  onChanged: _fanAutoMode ? null : _setFanManualCommand, // Disabled in auto mode
                ),
              ],
            ),
            if (_fanAutoMode)
              Text("Control automático activado. Se encenderá si la T° supera los ${_tempThreshold.toStringAsFixed(1)}°C.", style: TextStyle(fontSize: 12, color: Colors.grey[600]))
          ],
        ),
      ),
    );
  }

  Widget _buildValveControlCard() {
    return Card(
      elevation: 4.0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             Text("Control de Riego", style: Theme.of(context).textTheme.headline6),
             const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Icon(Icons.opacity, size: 40.0, color: _valveState ? Colors.blueAccent : Colors.grey),
                const Text("Válvula de Agua"),
                Switch(
                  value: _valveCommand,
                  onChanged: _setValveCommand,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildThresholdCard() {
    return Card(
      elevation: 4.0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Ajuste de Temperatura Automática", style: Theme.of(context).textTheme.headline6),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.thermostat, color: Colors.red),
                Expanded(
                  child: Slider(
                    value: _tempThreshold,
                    min: 15,
                    max: 40,
                    divisions: 25,
                    label: '${_tempThreshold.toStringAsFixed(1)} °C',
                    onChanged: (value) {
                       setState(() {
                         _tempThreshold = value;
                       });
                       _setTempThreshold(value);
                    },
                  ),
                ),
                Text('${_tempThreshold.toStringAsFixed(1)}°C'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
