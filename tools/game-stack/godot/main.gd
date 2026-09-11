extends Node


func _ready() -> void:
	var checks := {}
	checks["damage"] = _check_damage()
	checks["currency"] = _check_currency()
	checks["synthesis"] = _check_synthesis()
	checks["moba"] = _check_moba()
	checks["ascii_raycaster"] = _check_ascii_raycaster()

	var all_passed: bool = true
	var summary := ""
	for name in checks:
		var ok: bool = checks[name]
		all_passed = all_passed and ok
		summary += ("\n  %s: %s" % [name, "PASS" if ok else "FAIL"])

	var banner := "GAYA_BRIDGE_QUALIFICATION " + ("PASS" if all_passed else "FAIL") + summary
	$Result.text = banner
	print(banner)

	if OS.has_feature("web"):
		JavaScriptBridge.eval(
			"window.gayaBridgeQualification = "
			+ JSON.stringify({"passed": all_passed, "checks": checks})
		)
	if DisplayServer.get_name() == "headless":
		get_tree().quit(0 if all_passed else 1)


func _check_damage() -> bool:
	var bridge = ClassDB.instantiate("GayaBridge")
	# 10 normal incoming + 5 true damage, with Kravarius Crust (RD 2):
	# standard damage drops to 8, true damage bypasses reduction -> 13 total.
	var total: int = bridge.calculate_damage(10, 5, true)
	var ok := total == 13
	print("  damage(10 normal + 5 true, crust) = %d (expected 13) -> %s" % [total, "PASS" if ok else "FAIL"])
	return ok


func _check_currency() -> bool:
	var bridge = ClassDB.instantiate("GayaBridge")
	# 1 Yorman = 100 Khan, so 2 Yorman -> 200 Khan.
	var khan: int = bridge.convert_currency(2, "Yorman", "Khan")
	var ok := khan == 200
	print("  convert 2 Yorman -> Khan = %d (expected 200) -> %s" % [khan, "PASS" if ok else "FAIL"])
	return ok


func _check_synthesis() -> bool:
	var bridge = ClassDB.instantiate("GayaBridge")
	# Extracting synthesis threads from living tissue is a canonical violation.
	var violation: String = bridge.validate_synthesis(true)
	var ok := violation != ""
	print("  validate_synthesis(true) = \"%s\" (expected non-empty) -> %s" % [violation, "PASS" if ok else "FAIL"])
	return ok


func _check_moba() -> bool:
	var bridge = ClassDB.instantiate("GayaBridge")
	var id1: int = bridge.moba_add_context_block(
		"ashfall_crater", ["yorman_miner", "cinder_sprite"], "The miners share rumors of the crater floor."
	)
	var id2: int = bridge.moba_add_context_block(
		"underforge", ["khan_forgemaster"], "Forgemaster Kahn recounts the smelting of true steel."
	)

	# Query at the crater: the newest block located there (block 0) is always
	# retained first, then the top_k past blocks follow by relevance.
	var local: Array = bridge.moba_query_relevant("ashfall_crater", ["cinder_sprite"], 1)
	var local_ok: bool = local.size() == 2 \
		and local[0]["id"] == id1 \
		and local[0]["spatial_node"] == "ashfall_crater" \
		and local[0]["entities"].size() == 2 \
		and local[1]["id"] == id2

	# The current block is retained regardless of top_k (top_k == 0 here).
	var topk_zero: Array = bridge.moba_query_relevant("underforge", ["yorman_miner"], 0)
	var topk_zero_ok: bool = topk_zero.size() == 1 and topk_zero[0]["id"] == id2

	# A node with no local blocks falls back to entity overlap: the forge block
	# (entity "khan_forgemaster") is returned over the crater block.
	var far: Array = bridge.moba_query_relevant("nowhere_lost", ["khan_forgemaster"], 1)
	var far_ok: bool = far.size() == 1 and far[0]["id"] == id2

	var ok := id1 == 0 and id2 == 1 and local_ok and topk_zero_ok and far_ok
	print("  moba block ids = [%d, %d] (expected [0, 1])" % [id1, id2])
	print("  moba local-block gating = %s, top_k-independent current = %s, entity-overlap fallback = %s -> %s" % [
		"PASS" if local_ok else "FAIL",
		"PASS" if topk_zero_ok else "FAIL",
		"PASS" if far_ok else "FAIL",
		"PASS" if ok else "FAIL",
	])
	return ok


func _check_ascii_raycaster() -> bool:
	var bridge = ClassDB.instantiate("GayaBridge")
	bridge.set_room_map("commons")
	# Render 40 columns x 12 rows at pose (5.0, 5.0, 0.0)
	var frame: String = bridge.render_ascii_frame(5.0, 5.0, 0.0, 40, 12)
	var lines := frame.split("\n")
	var valid_dimensions := lines.size() == 12
	var valid_cols := true
	for line in lines:
		if line.length() != 40:
			valid_cols = false
			break
	var ok := valid_dimensions and valid_cols and frame.length() > 0
	print("  render_ascii_frame(40x12) = %d lines, valid_cols=%s -> %s" % [
		lines.size(),
		"true" if valid_cols else "false",
		"PASS" if ok else "FAIL"
	])
	if ok:
		print("  --- 3D ASCII Viewport Preview (First 4 rows) ---")
		for i in range(min(4, lines.size())):
			print("    |%s|" % lines[i])
	return ok
