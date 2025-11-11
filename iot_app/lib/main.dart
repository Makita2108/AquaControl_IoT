
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:async';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // TODO: Add your Firebase project configuration here
  // await Firebase.initializeApp(
  //   options: FirebaseOptions(
  //     apiKey: "YOUR_API_KEY",
  //     authDomain: "YOUR_AUTH_DOMAIN",
  //     databaseURL: "YOUR_DATABASE_URL",
  //     projectId: "YOUR_PROJECT_ID",
  //     storageBucket: "YOUR_STORAGE_BUCKET",
  //     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //     appId: "YOUR_APP_ID",
  //   ),
  // );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Greenhouse Monitor',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      home: LoginScreen(),
    );
  }
}

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // TODO: Implement your login screen UI and authentication logic here
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
      ),
      body: Center(
        child: ElevatedButton(
          child: Text('Login (dummy)'),
          onPressed: () {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => MyHomePage()),
            );
          },
        ),
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  DatabaseReference _databaseReference;
  double _temperature = 0;
  double _humidity = 0;
  bool _fanOn = false;
  List<FlSpot> _temperatureData = [];
  List<FlSpot> _humidityData = [];
  Timer _timer;

  @override
  void initState() {
    super.initState();
    //_databaseReference = FirebaseDatabase.instance.ref();
    _databaseReference = FirebaseDatabase.instance.refFromURL('YOUR_DATABASE_URL');

    _databaseReference.child('data/temperature').onValue.listen((event) {
      final data = event.snapshot.value as double;
      setState(() {
        _temperature = data;
        _temperatureData.add(FlSpot(DateTime.now().millisecondsSinceEpoch.toDouble(), data));
      });
    });

    _databaseReference.child('data/humidity').onValue.listen((event) {
      final data = event.snapshot.value as double;
      setState(() {
        _humidity = data;
        _humidityData.add(FlSpot(DateTime.now().millisecondsSinceEpoch.toDouble(), data));
      });
    });

    _databaseReference.child('commands/fan').onValue.listen((event) {
      final data = event.snapshot.value as bool;
      setState(() {
        _fanOn = data;
      });
    });
  }

  void _toggleFan(bool value) {
    _databaseReference.child('commands/fan').set(value);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Greenhouse Monitor'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: <Widget>[
                    Text('Temperature', style: Theme.of(context).textTheme.headline6),
                    Text('$_temperature °C', style: Theme.of(context).textTheme.headline4),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: <Widget>[
                    Text('Humidity', style: Theme.of(context).textTheme.headline6),
                    Text('$_humidity %', style: Theme.of(context).textTheme.headline4),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: <Widget>[
                    Text('Fan Control', style: Theme.of(context).textTheme.headline6),
                    SwitchListTile(
                      title: Text('Fan'),
                      value: _fanOn,
                      onChanged: _toggleFan,
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: <Widget>[
                    Text('Temperature History', style: Theme.of(context).textTheme.headline6),
                    SizedBox(height: 16),
                    Container(
                      height: 200,
                      child: LineChart(
                        LineChartData(
                          lineBarsData: [
                            LineChartBarData(
                              spots: _temperatureData,
                              isCurved: true,
                              colors: [Colors.blue],
                              barWidth: 4,
                              isStrokeCapRound: true,
                              belowBarData: BarAreaData(show: false),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: <Widget>[
                    Text('Humidity History', style: Theme.of(context).textTheme.headline6),
                    SizedBox(height: 16),
                    Container(
                      height: 200,
                      child: LineChart(
                        LineChartData(
                          lineBarsData: [
                            LineChartBarData(
                              spots: _humidityData,
                              isCurved: true,
                              colors: [Colors.red],
                              barWidth: 4,
                              isStrokeCapRound: true,
                              belowBarData: BarAreaData(show: false),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
