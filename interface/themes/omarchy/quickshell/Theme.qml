pragma Singleton
import QtQuick

QtObject {
    id: theme

    // Color Roles (ISA-KAD-AESTHETIC-001)
    readonly property color canvas: "#07090e"
    readonly property color panel: "#151923"
    readonly property color crimson: "#1a080a"
    readonly property color lift: "#1b202b"

    readonly property color cyan: "#68d5e8"
    readonly property color bone: "#e7e8e6"
    readonly property color secondary: "#9da5b2"
    readonly property color faint: "#515d70"

    readonly property color gold: "#e7ba72"
    readonly property color green: "#79d69a"
    readonly property color red: "#f05252"
    readonly property color purple: "#c084fc"

    readonly property color borderBase: "#303746"
    readonly property color borderHot: "#68d5e8"

    // Typography
    readonly property string fontMono: "JetBrains Mono"
    readonly property string fontProse: "Inter"

    // Geometry
    readonly property int radius: 2
    readonly property int borderWidth: 2

    // Motion Profile (150ms state transitions)
    readonly property int animDuration: 150
    readonly property int targetRefreshRate: 200

    // Strict Silence Invariant
    readonly property bool audioEnabled: false
}
