import QtQuick
import QtQuick.Layouts

Item {
    id: hudOverlay
    width: parent ? parent.width : 1920
    height: 36

    Rectangle {
        id: barBackground
        anchors.fill: parent
        color: Theme.panel
        border.color: Theme.borderBase
        border.width: 1
        radius: Theme.radius

        RowLayout {
            anchors.fill: parent
            anchors.leftMargin: 12
            anchors.rightMargin: 12
            spacing: 16

            // System Identity
            Text {
                text: "KAD // CYBERDECK HUD"
                color: Theme.cyan
                font.family: Theme.fontMono
                font.pixelSize: 12
                font.bold: true
            }

            // Epistemic Status Badges
            Rectangle {
                Layout.preferredHeight: 20
                Layout.preferredWidth: 90
                color: Qt.rgba(Theme.gold.r, Theme.gold.g, Theme.gold.b, 0.15)
                border.color: Theme.gold
                border.width: 1
                radius: Theme.radius

                Text {
                    anchors.centerIn: parent
                    text: "CANONICAL"
                    color: Theme.gold
                    font.family: Theme.fontMono
                    font.pixelSize: 10
                    font.bold: true
                }
            }

            Rectangle {
                Layout.preferredHeight: 20
                Layout.preferredWidth: 80
                color: Qt.rgba(Theme.cyan.r, Theme.cyan.g, Theme.cyan.b, 0.15)
                border.color: Theme.cyan
                border.width: 1
                radius: Theme.radius

                Text {
                    anchors.centerIn: parent
                    text: "DERIVED"
                    color: Theme.cyan
                    font.family: Theme.fontMono
                    font.pixelSize: 10
                    font.bold: true
                }
            }

            Item { Layout.fillWidth: true }

            // Clock / Timestamp
            Text {
                id: timestampText
                text: Qt.formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss")
                color: Theme.bone
                font.family: Theme.fontMono
                font.pixelSize: 12
            }
        }
    }
}
