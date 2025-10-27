// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:boutique_mobile/main.dart';

void main() {
  testWidgets('Boutique app loads smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(BoutiqueApp());

    // Verify that our splash screen shows the app title
    expect(find.text('Boutique'), findsOneWidget);
    expect(find.text('Tienda de Moda'), findsOneWidget);

    // Wait for navigation and check placeholder screen
    await tester.pumpAndSettle(Duration(seconds: 4));

    // After splash, should show placeholder screen
    expect(find.text('¡Bienvenido a Boutique!'), findsOneWidget);
  });
}
