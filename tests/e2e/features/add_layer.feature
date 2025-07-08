Feature: レイヤー追加モーダル

  Scenario: レイヤー追加ボタンをクリックして新しいレイヤーを追加する
    Given レイヤーリスト画面を開いている
    When レイヤー追加ボタンをクリックする
    Then レイヤー追加モーダルが表示される
    When レイヤーIDに "test-layer" と入力する
    And タイプに "symbol" を選択する
    And 追加ボタンをクリックする
    Then レイヤーリストに "test-layer" が表示される
