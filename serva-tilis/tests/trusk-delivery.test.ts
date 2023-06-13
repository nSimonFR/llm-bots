/* eslint-env jest */
import * as dotenv from "dotenv";

dotenv.config();

import getModel from "../src/utils/model";
import deliveryChain, { chainType } from "../src/agents/trusk-delivery";

const order = {
  integration_id: "ikea_centiro",
  brand: "ikea_centiro",
  log_order_id: "hKXVL4uenV",
  unpacking: false,
  express_delivery: false,
  removal: false,
  external_pickup: false,
  return_warehouse_to_store: false,
  delivery: true,
  return: false,
  floor_config: "room_of_choice",
  assembly: null,
  handlers: null,
  shipment_site: "ikea_store_marseille_la_valentine",
  delivery_zone: null,
  log_order_number: "1259396016",
  shipment_number: "806511600",
  log_order_metadata:
    '{"edi2": true, "flow": "lcd", "amounts": [{"code": "FREIGHTCOST", "gross": 0, "currency": "EUR"}], "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "exchange": false, "lsc_b_u_code": "433", "delivery_code": "HD", "departure_date": "2022-02-02T14:00:00.000Z", "store_b_u_code": "241", "delivery_method": "TRUCK", "return_b_u_code": "433", "sender_b_u_code": "433", "migrated_to_flow": true, "wms_order_number": "100877206", "prefered_language": "fr", "delivery_method_id": "truck", "total_volume_matches": true, "total_weight_matches": true, "delivery_instructions": [{"code": "TRUCK_DELIVERY_RESTRICTIONS", "text": "APPELER 0630725628", "selector": "YES"}, {"code": "ELEVATOR_EXISTS", "text": "YES", "selector": "YES"}, {"code": "FLOOR_NO", "text": "17"}, {"code": "DOOR_CODE", "text": "APPELER 0630725628", "selector": "YES"}, {"code": "ADDITIONAL_INFO_TSP", "text": "17EME ETAGE"}], "total_packages_matches": true}',
  log_order_articles:
    '{"data": [{"price": 190.833333, "volume": 0.2069, "weight": 98, "currency": "EUR", "quantity": 1, "unit_price": 190.833333, "ddc_article": false, "description": "SONGESAND Arm 120x60x191 Blanc", "line_number": 26, "article_number": "90347351", "parcel_sequence_no": "806634038"}, {"price": 25, "volume": 0.0103, "weight": 3.2, "currency": "EUR", "quantity": 2, "unit_price": 12.5, "ddc_article": false, "description": "EKET Rgt 35x25x35 Gris Clair", "line_number": 31, "article_number": "10332122", "parcel_sequence_no": "806634038"}, {"price": 9.966668, "volume": 0.0174, "weight": 0.363, "currency": "EUR", "quantity": 4, "unit_price": 2.491667, "ddc_article": false, "description": "FNISS N Poub 10 L Blanc", "line_number": 13, "article_number": "40295439", "parcel_sequence_no": "806634038"}, {"price": 25, "volume": 0.0103, "weight": 3.2, "currency": "EUR", "quantity": 2, "unit_price": 12.5, "ddc_article": false, "description": "EKET Rgt 35x25x35 Gris Turquoise", "line_number": 42, "article_number": "50474143", "parcel_sequence_no": "806634038"}, {"price": 33.3, "volume": 0.0015, "weight": 0.377, "currency": "EUR", "quantity": 4, "unit_price": 8.325, "ddc_article": false, "description": "NÄVLINGE Spot À Pince LED Blanc", "line_number": 20, "article_number": "70449888", "parcel_sequence_no": "806634038"}, {"price": 99.975, "volume": 0.0238, "weight": 10.7, "currency": "EUR", "quantity": 3, "unit_price": 33.325, "ddc_article": false, "description": "HAUGA Tab Chevet 40x36 Gris", "line_number": 16, "article_number": "40488961", "parcel_sequence_no": "806634038"}]}',
  log_order_contacts:
    '{"data": [{"code": "PICKUP", "name": "433 IKEA LA VALENTINE", "email": "no.reply@ikea.com", "address": {"lat": 43.2931223, "lon": 5.4810653, "city": "Marseille", "route": "Avenue François Chardigny", "country": "France", "address1": "ZAC la Valentine - La Ravelle", "locality": "Marseille", "place_id": "ChIJYcdb0FYoVQ0RahgvNgPLG1c", "address_raw": "ZAC la Valentine - La Ravelle\\n13011\\nMarseille", "postal_code": "13011", "postal_town": null, "country_code": "fr", "street_number": null, "address_string": "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France", "postal_code_raw": "13011"}, "cell_phone": null, "primary_phone": null, "cell_phone_raw": null, "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}, {"code": "RECEIVER", "name": "SARL LOGES", "email": "cedric.faure.fr@gmail.com", "address": {"lat": 43.2942168, "lon": 5.4010519, "city": "MARSEILLE", "route": "Boulevard Sakakini", "country": "France", "address1": "92 BOULEVARD SAKAKINI", "address2": "17EME ETAGE", "locality": "Marseille", "place_id": "ChIJSSbCcFy_yRIR2g0oL6qyAgU", "address_raw": "92 BOULEVARD SAKAKINI\\n17EME ETAGE\\n13005\\nMARSEILLE", "postal_code": "13005", "postal_town": null, "country_code": "fr", "street_number": "92", "address_string": "92 Bd Sakakini, 13005 Marseille, France", "postal_code_raw": "13005"}, "attention": "Cédric Faure", "cell_phone": "+33 6 30 72 56 28", "primary_phone": null, "cell_phone_raw": "+33630725628", "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}, {"code": "RETURNTO", "name": "433 IKEA LA VALENTINE", "email": "no.reply@ikea.com", "address": {"lat": 43.2931223, "lon": 5.4810653, "city": "Marseille", "route": "Avenue François Chardigny", "country": "France", "address1": "ZAC la Valentine - La Ravelle", "locality": "Marseille", "place_id": "ChIJYcdb0FYoVQ0RahgvNgPLG1c", "address_raw": "ZAC la Valentine - La Ravelle\\n13011\\nMarseille", "postal_code": "13011", "postal_town": null, "country_code": "fr", "street_number": null, "address_string": "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France", "postal_code_raw": "13011"}, "cell_phone": null, "primary_phone": null, "cell_phone_raw": null, "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}, {"code": "SENDER", "name": "433 IKEA LA VALENTINE", "email": "no.reply@ikea.com", "address": {"lat": 43.2931223, "lon": 5.4810653, "city": "Marseille", "route": "Avenue François Chardigny", "country": "France", "address1": "ZAC la Valentine - La Ravelle", "locality": "Marseille", "place_id": "ChIJYcdb0FYoVQ0RahgvNgPLG1c", "address_raw": "ZAC la Valentine - La Ravelle\\n13011\\nMarseille", "postal_code": "13011", "postal_town": null, "country_code": "fr", "street_number": null, "address_string": "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France", "postal_code_raw": "13011"}, "cell_phone": null, "primary_phone": null, "cell_phone_raw": null, "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}, {"code": "TRUSK_PICKUP", "name": "marseille_la_valentine", "address": {"lat": 43.2931223, "lon": 5.4810653, "route": "Avenue François Chardigny", "country": "France", "locality": "Marseille", "place_id": "ChIJYcdb0FYoVQ0RahgvNgPLG1c", "address_raw": "13011", "postal_code": "13011", "postal_town": null, "street_number": null, "address_string": "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France", "postal_code_raw": "13011"}, "cell_phone": null, "primary_phone": null, "cell_phone_raw": null, "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}, {"code": "TRUSK_DROPOFF", "name": "SARL LOGES", "email": "cedric.faure.fr@gmail.com", "address": {"lat": 43.2942168, "lon": 5.4010519, "city": "MARSEILLE", "route": "Boulevard Sakakini", "country": "France", "address1": "92 BOULEVARD SAKAKINI", "address2": "17EME ETAGE", "locality": "Marseille", "place_id": "ChIJSSbCcFy_yRIR2g0oL6qyAgU", "address_raw": "92 BOULEVARD SAKAKINI\\n17EME ETAGE\\n13005\\nMARSEILLE", "postal_code": "13005", "postal_town": null, "country_code": "fr", "street_number": "92", "address_string": "92 Bd Sakakini, 13005 Marseille, France", "postal_code_raw": "13005"}, "attention": "Cédric Faure", "cell_phone": "+33 6 30 72 56 28", "primary_phone": null, "cell_phone_raw": "+33630725628", "secondary_phone": null, "primary_phone_raw": null, "secondary_phone_raw": null}]}',
  log_order_ready_at: "2022-02-02T10:03:18+01:00",
  log_order_total_packages: 1,
  log_order_total_weight: 145.86,
  log_order_total_volume: 0.41354044,
  log_order_state: "processable",
  log_order_statuses:
    '{"data": [{"date": "2022-01-29T15:38:38Z", "status": "order_created", "vehicle": null, "metadata": {"id": "hKXVL4uenV"}, "created_at": "2022-01-29T15:38:38Z"}, {"date": "2022-02-02T16:25:44Z", "status": "mission_assigned", "vehicle": null, "metadata": {"id": "o_OWrB97Sb"}, "created_at": "2022-02-02T16:25:44Z"}, {"date": "2022-02-03T07:53:45Z", "status": "pickup_started", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "1il6fD_GfL", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T07:53:45Z"}, {"date": "2022-02-03T07:53:45Z", "status": "pickup_arrival", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "1il6fD_GfL", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T07:53:47Z"}, {"date": "2022-02-03T07:54:38Z", "status": "pickup_completed", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "1il6fD_GfL", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T07:54:38Z"}, {"date": "2022-02-03T09:11:03Z", "status": "dropoff_started", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "8aZlqZDJ5", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T09:11:03Z"}, {"date": "2022-02-03T09:11:03Z", "status": "dropoff_arrival", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "8aZlqZDJ5", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T09:11:04Z"}, {"date": "2022-02-03T09:33:52Z", "status": "dropoff_completed", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "metadata": {"task_id": "8aZlqZDJ5", "driver_id": "b384r19vT", "service_id": "o_OWrB97Sb"}, "created_at": "2022-02-03T09:33:53Z"}, {"date": "2022-03-02T06:59:45Z", "status": "order_not_prepared", "comment": "Commande LCD non préparée par le magasin", "vehicle": {"type": "truck", "fuel_type": "diesel", "co2_amount": 200, "license_plate": "FW-280-GX", "quality_certification": "criteria2"}, "created_at": "2022-03-02T06:59:45Z"}]}',
  log_order_updated_at: "2023-03-28T01:49:19.524+02:00",
  log_order_created_at: "2022-01-29T16:38:38.362+01:00",
  log_order_deleted_at: null,
  log_order_details: null,
  log_order_notes: null,
  date_range_from: "2022-02-03T08:00:00+01:00",
  date_range_to: "2022-02-03T12:00:00+01:00",
  metadata_flow: "lcd",
  metadata_internal_return: null,
  metadata_delivery_code: "HD",
  metadata_delivery_instructions:
    '[{"code": "TRUCK_DELIVERY_RESTRICTIONS", "text": "APPELER 0630725628", "selector": "YES"}, {"code": "ELEVATOR_EXISTS", "text": "YES", "selector": "YES"}, {"code": "FLOOR_NO", "text": "17"}, {"code": "DOOR_CODE", "text": "APPELER 0630725628", "selector": "YES"}, {"code": "ADDITIONAL_INFO_TSP", "text": "17EME ETAGE"}]',
  metadata_departure_date: "2022-02-02T14:00:00.000Z",
  metadata_arrival_date: null,
  metadata_edi2: "true",
  metadata_lsc_b_u_code: "433",
  metadata_sender_b_u_code: "433",
  metadata_return_b_u_code: "433",
  metadata_store_b_u_code: "241",
  metadata_delivery_method_id: "truck",
  metadata_wms_order_number: "100877206",
  metadata_delivery_method: "truck",
  date_range_from_month: "2022-02-01T00:00:00+01:00",
  date_range_from_week: "2022-01-31T00:00:00+01:00",
  date_range_from_day: "2022-02-03T00:00:00+01:00",
  sum_articles_price: 384.07500100000004,
  sum_articles_weight: 115.84,
  order_id: "o_OWrB97Sb",
  user_id: "SMUhGVFeQ",
  order_start_date: "2022-02-03T07:30:00+01:00",
  order_end_date: "2022-02-03T09:48:56+01:00",
  order_arrival_date: "2022-02-03T08:00:00+01:00",
  end_contact_id: "BRVoxtkVQm",
  start_contact_id: "gA1prTED5v",
  customer_id: "pOKJ6jroAJ",
  customer_flag: "ikea_france",
  order_created_at: "2022-01-29T16:38:59.37+01:00",
  order_updated_at: "2023-05-20T07:31:09.445+02:00",
  start_lat: 43.2931223,
  start_lng: 5.4810653,
  start_locality: "Marseille",
  start_postal_code: "13011",
  end_lat: 43.2942168,
  end_lng: 5.4010519,
  end_locality: "Marseille",
  end_postal_code: "13005",
  pickup_slot_start: "2022-02-03T08:30:00+01:00",
  pickup_slot_end: "2022-02-03T10:30:00+01:00",
  dropoff_slot_start: "2022-02-03T09:00:00+01:00",
  dropoff_slot_end: "2022-02-03T13:00:00+01:00",
  metadata__pfchoices__ba13packagescount: null,
  metadata__pfchoices__expressslot: null,
  metadata__pfchoices__hasspecialitems: null,
  metadata__pfchoices__highestpackage: null,
  metadata__pfchoices__highest_package: null,
  metadata__pfchoices__longestpackage: null,
  metadata__pfchoices__longest_package: null,
  metadata__pfchoices__packagespackaging: null,
  metadata__pfchoices__packagesweight__it: null,
  metadata__pfchoices__packagesweight__st: null,
  metadata__pfchoices__packages_packaging: null,
  metadata__pfchoices__packages_weight: null,
  metadata__pfchoices__slotsmode: null,
  metadata__pfchoices__truskerscount: null,
  metadata__pfchoices__truskers_count: null,
  metadata__pfchoices__weightgt90packagescount: null,
  metadata__pfchoices__weightgt90packagesweight_0__it: null,
  metadata__pfchoices__weightgt90packagesweight_0__st: null,
  metadata__pfchoices__weightgt90packagesweight_1: null,
  metadata__pfchoices__weightgt90packagesweight_2: null,
  metadata__pfchoices__woodstovepackagescount: null,
  metadata__pfchoices__workplanpackagescount: null,
  third_party_billee__completename: null,
  third_party_billee__phonenumber: null,
  metadata__pfchoices__scaffoldingpackagescount: null,
  metadata__pfchoices__packagesweight__de: null,
  metadata__pfchoices__tilespackagescount: null,
  metadata__pfchoices__hasscaffolding: null,
  metadata__pfchoices__hasassembledkitchen: null,
  _sdc_batched_at: "2023-05-20T07:42:56.107+02:00",
  _sdc_received_at: "2023-05-20T07:33:19+02:00",
  _sdc_sequence: 1684560784379111400,
  _sdc_table_version: 1674120690915,
  advisor: "SyWOj4pxX",
  allocator: "b8Euos3_WP",
  amount_refunded: 0,
  arrival_date: "2022-02-03T08:00:00+01:00",
  created_at: "2022-01-29T16:38:59.37+01:00",
  deleted: false,
  details:
    "Course annulée car non préparée par le magasin.\n" +
    "\n" +
    "Tournée 5 IKEA du 03/02/2022 - Point 4\n" +
    "Quai n°Marseille\n" +
    "Créneau de livraison : 08:00-12:00\n" +
    "\n" +
    "Infos contact au départ:\n" +
    "Marseille_la_valentine\n" +
    "13011\n" +
    "\n" +
    "Infos contact à l'arrivée:\n" +
    "Sarl Loges\n" +
    "+33630725628\n" +
    "92 BOULEVARD SAKAKINI\n" +
    "17EME ETAGE\n" +
    "13005\n" +
    "MARSEILLE\n" +
    "\n" +
    "Infos supplémentaires:\n" +
    "APPELER 0630725628\n" +
    "YES\n" +
    "Étage: 17\n" +
    "APPELER 0630725628\n" +
    "17EME ETAGE\n" +
    "\n" +
    "Articles:\n" +
    "1x 90347351 SONGESAND Arm 120x60x191 Blanc\n" +
    "2x 10332122 EKET Rgt 35x25x35 Gris Clair\n" +
    "4x 40295439 FNISS N Poub 10 L Blanc\n" +
    "2x 50474143 EKET Rgt 35x25x35 Gris Turquoise\n" +
    "4x 70449888 NÄVLINGE Spot À Pince LED Blanc\n" +
    "3x 40488961 HAUGA Tab Chevet 40x36 Gris",
  distance: 8922,
  driver: "Z4U937_Gv",
  dropoff_slot__end: "2022-02-03T11:00:00.000Z",
  dropoff_slot__start: "2022-02-03T07:00:00.000Z",
  end_contact: "BRVoxtkVQm",
  end_date: "2022-02-03T09:48:56+01:00",
  end_elevator: false,
  end_floors: 17,
  end_handling_time: 6536,
  end_location_address: "92 Bd Sakakini, 13005 Marseille, France",
  end_location_address_object__address_string:
    "92 Bd Sakakini, 13005 Marseille, France",
  end_location_address_object__country: "France",
  end_location_address_object__lat__de: 43.2942168,
  end_location_address_object__lat__it: null,
  end_location_address_object__locality: "Marseille",
  end_location_address_object__lon__de: 5.4010519,
  end_location_address_object__lon__it: null,
  end_location_address_object__place_id: "ChIJSSbCcFy_yRIR2g0oL6qyAgU",
  end_location_address_object__postal_code: "13005",
  end_location_address_object__postal_town: null,
  end_location_address_object__route: "Boulevard Sakakini",
  end_location_address_object__street_number: "92",
  end_location_place_id: "ChIJSSbCcFy_yRIR2g0oL6qyAgU",
  end_sidewalk: false,
  ended_date: "2022-02-03T10:33:52.682+01:00",
  fee_key: null,
  fee_percent: 0.44,
  forth_order: null,
  goods_count: null,
  goods_value: 460,
  goods_weight: 145,
  google_agenda_event_id: null,
  hotspot: "marseille",
  id: "o_OWrB97Sb",
  in_cash: false,
  in_transfer: false,
  invoice_key: null,
  is_invoiced: false,
  is_paid: false,
  is_quote_validated: true,
  manual_price: true,
  metadata__jotform__aisle: null,
  metadata__jotform__picking: null,
  metadata__pfChoices__ba13PackagesCount: null,
  metadata__pfChoices__expressSlot: null,
  metadata__pfChoices__hasSpecialItems: null,
  metadata__pfChoices__highestPackage: null,
  metadata__pfChoices__highest_package: null,
  metadata__pfChoices__longestPackage: null,
  metadata__pfChoices__longest_package: null,
  metadata__pfChoices__packagesPackaging: null,
  metadata__pfChoices__packagesWeight__it: null,
  metadata__pfChoices__packagesWeight__st: null,
  metadata__pfChoices__packages_packaging: null,
  metadata__pfChoices__packages_weight: null,
  metadata__pfChoices__slotsMode: null,
  metadata__pfChoices__truskersCount: null,
  metadata__pfChoices__truskers_count: null,
  metadata__pfChoices__weightGt90PackagesCount: null,
  metadata__pfChoices__weightGt90PackagesWeight_0__it: null,
  metadata__pfChoices__weightGt90PackagesWeight_0__st: null,
  metadata__pfChoices__weightGt90PackagesWeight_1: null,
  metadata__pfChoices__weightGt90PackagesWeight_2: null,
  metadata__pfChoices__woodstovePackagesCount: null,
  metadata__pfChoices__workplanPackagesCount: null,
  no_fee: false,
  notes:
    "Course annulée car non préparée par le magasin.\n" +
    "\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "Créneau de livraison: 03/02/2022 08:00 - 03/02/2022 12:00\n" +
    "\n" +
    "========================================\n" +
    " \n" +
    "Date de modification : 29/01/2022 à 17:40\n" +
    "Auteur : Infra Trusk\n" +
    "Modifications :\n" +
    "- Contact au départ : Marseille_la_valentine - null => Marseille_la_valentine - null\n" +
    "- Etage à l'arrivée : 0 => 17\n" +
    "\n" +
    "\n" +
    "\n" +
    "========================================\n" +
    " \n" +
    "Date de modification : 29/01/2022 à 17:54\n" +
    "Auteur : Infra Trusk\n" +
    "Modification :\n" +
    "- Contact au départ : Marseille_la_valentine - null => Marseille_la_valentine - null\n" +
    "\n" +
    "\n" +
    "\n" +
    "========================================\n" +
    " \n" +
    "Date de modification : 01/02/2022 à 19:16\n" +
    "Auteur : Infra Trusk\n" +
    "Modification :\n" +
    "- Contact au départ : Marseille_la_valentine - null => Marseille_la_valentine - null\n" +
    "\n" +
    "\n" +
    "\n" +
    "========================================\n" +
    " \n" +
    "Date de modification : 02/02/2022 à 10:03\n" +
    "Auteur : Infra Trusk\n" +
    "Modification :\n" +
    "- Contact au départ : Marseille_la_valentine - null => Marseille_la_valentine - null\n" +
    "\n" +
    "\n" +
    "\n" +
    "========================================\n" +
    " \n" +
    "Date de modification : 02/02/2022 à 10:19\n" +
    "Auteur : Infra Trusk\n" +
    "Modification :\n" +
    "- Contact au départ : Marseille_la_valentine - null => Marseille_la_valentine - null\n" +
    "\n",
  onfleet_status: "DROPOFF_COMPLETED",
  order_number: "1259396016",
  organisation: "rJqTxqgvG",
  paid: null,
  pickup_slot__end: "2022-02-03T08:30:00.000Z",
  pickup_slot__start: "2022-02-03T06:30:00.000Z",
  price: 4972,
  pricing: "b2b_ikea_lcd_marseille",
  processing_date: "2022-02-03T08:53:45.689+01:00",
  quote_validated: "2022-01-29T16:38:59.663+01:00",
  return_order: null,
  ride_time: 1578.5,
  slots_mode: "dropoff",
  start_contact: "gA1prTED5v",
  start_date: "2022-02-03T07:30:00+01:00",
  start_elevator: false,
  start_floors: 0,
  start_handling_time: 416,
  start_location_address:
    "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France",
  start_location_address_object__address_string:
    "ZAC la Ravelle, Av. François Chardigny, 13011 Marseille, France",
  start_location_address_object__country: "France",
  start_location_address_object__lat: 43.2931223,
  start_location_address_object__locality: "Marseille",
  start_location_address_object__lon: 5.4810653,
  start_location_address_object__place_id: "ChIJYcdb0FYoVQ0RahgvNgPLG1c",
  start_location_address_object__postal_code: "13011",
  start_location_address_object__postal_town: null,
  start_location_address_object__route: "Avenue François Chardigny",
  start_location_address_object__street_number: null,
  start_location_place_id: "ChIJYcdb0FYoVQ0RahgvNgPLG1c",
  start_sidewalk: false,
  status: "ENDED",
  stripe_charge_id: null,
  third_party_billee__completeName: null,
  third_party_billee__email: null,
  third_party_billee__phoneNumber: null,
  truck: "qrhT4XPqj",
  truck_size: 20,
  trusk_customer: "pOKJ6jroAJ",
  two_people: true,
  updated_at: "2023-05-20T07:31:09.445+02:00",
  user: "SMUhGVFeQ",
  want_in_cash: false,
  want_in_transfer: false,
  will_never_be_paid: false,
  metadata__details3: null,
  metadata__pfChoices__scaffoldingPackagesCount: null,
  metadata__pfChoices__packagesWeight__de: null,
  metadata__pfChoices__tilesPackagesCount: null,
  metadata__details1: null,
  metadata__pfChoices__hasScaffolding: null,
  metadata__details2: null,
  metadata__pfChoices__hasAssembledKitchen: null,
  start_phone_number: null,
  end_complete_name: "Sarl Loges",
  end_email: "cedric.faure.fr+kqvqprqxzx@gmail.com",
  start_email: "anonymous+ahohymao2@trusk.com",
  end_phone_number: "+33 6 30 72 56 28",
  start_complete_name: "Marseille_la_valentine",
  driver_name: "Abdeldjallil Djefaflia",
  organisation_name: "TRANSPORT ET DEMENAGEMENT MARSEILLAIS - TDM -",
  tags: "{truck,ikea_order_not_prepared,lcd,roundtrips,lcd_marseille,ikea_order_payed_less}",
  delivery_removal: false,
  delivery_return: false,
  delivery_failure: false,
  handling_unit: false,
  roundtrip_subvention: false,
  service_id: "o_OWrB97Sb",
  pickup_task_id: "1il6fD_GfL",
  pickup_status: "completed",
  pickup_label: "order_pickup",
  pickup_task_arrival_at: "2022-02-03T08:53:45.926+01:00",
  pickup_task_completed_at: "2022-02-03T08:54:38.378+01:00",
  pickup_task_updated_at: "2022-02-03T08:55:37.151+01:00",
  pickup_task_signed_at: "2022-02-03T08:55:37.144+01:00",
  pickup_task_tracking_url: "https://onf.lt/5e51bdc44f",
  pickup_task_deleted_at: null,
  pickup_comment: null,
  pickup_is_failed: false,
  dropoff_task_id: "8aZlqZDJ5",
  dropoff_status: "completed",
  dropoff_label: "order_dropoff",
  dropoff_task_arrival_at: "2022-02-03T10:11:03.522+01:00",
  dropoff_task_completed_at: "2022-02-03T10:33:52.682+01:00",
  dropoff_task_updated_at: "2022-02-03T10:34:51.087+01:00",
  dropoff_task_signed_at: "2022-02-03T10:34:51.082+01:00",
  dropoff_task_tracking_url: "https://onf.lt/dae92821b8",
  dropoff_task_deleted_at: null,
  dropoff_comment: null,
  dropoff_is_failed: false,
  tmp_order_task_max_updated_at: "2022-02-03T09:34:51.087+01:00",
  tmp_order_log_order_sum_task_max_updated_at: "2023-05-20T05:31:09.445+02:00",
  dispatch_order_updated_at: "2022-04-04T09:32:09.688+02:00",
  dispatch_order_driver: "Z4U937_Gv",
  pickupslot_start_date: "2022-02-03T07:30:00+01:00",
  pickupslot_end_date: "2022-02-03T09:30:00+01:00",
  dropoffslot_start_date: "2022-02-03T08:00:00+01:00",
  dropoffslot_end_date: "2022-02-03T12:00:00+01:00",
  rating_score: null,
  rating_created_at: null,
  truck_updated_at: "2022-01-25T10:16:15.385+01:00",
  customer_updated_at: "2023-06-01T16:12:55.683+02:00",
  max_transaction_updated_at: "2022-04-04T09:32:09.7+02:00",
  max_updated_at: "2023-06-01T14:12:55.683+02:00",
  delivery_id: "o_OWrB97Sb",
  merged_delivery: true,
  merged_return: false,
  merged_floor_config: "room_of_choice",
  delta_arrival_at_dropoffslot_start_date: 7863.522,
  delta_completed_at_dropoffslot_start_date: 9232.682,
  delta_arrival_at_dropoffslot_end_date: -6536.478,
  delta_completed_at_dropoffslot_end_date: -5167.318,
  delta_arrival_at_dropoffslot_start_date_5h: 7863.522,
  delta_completed_at_dropoffslot_end_date_5h: -5167.318,
  delta_arrival_at_dropoffslot_end_date_5h: -6536.478,
  delta_completed_at_dropoffslot_start_date_5h: 9232.682,
  delta_arrival_at_pickupslot_start_date: 5025.926,
  delta_completed_at_pickupslot_start_date: 5078.378,
  delta_arrival_at_pickupslot_end_date: -2174.074,
  delta_completed_at_pickupslot_end_date: -2121.622,
  delta_arrival_at_pickupslot_start_date_5h: 3225.926,
  delta_completed_at_pickupslot_end_date_5h: -11121.622,
  delta_arrival_at_pickupslot_end_date_5h: -11174.074,
  delta_completed_at_pickupslot_start_date_5h: 3278.378,
  assigned_truck_id: "qrhT4XPqj",
  assigned_truck_default_equipment: true,
  assigned_truck_is_deleted: false,
  assigned_truck_heavyweight: false,
  assigned_truck_license_plate: "FW-280-GX",
  assigned_truck_loading_ramp: false,
  assigned_truck_tailgate: false,
  assigned_truck_size: 12,
  assigned_truck_is_branded: false,
  discount_reason_order_aborted_by_customer: false,
  discount_reason_trusker_had_to_wait: false,
  discount_reason_more_handling_than_expected: false,
  discount_reason_late_trusker: false,
  discount_reason_more_distance_than_expected: false,
  discount_reason_items_added: false,
  discount_reason_late_customer_order_maintained: false,
  discount_reason_invoicing_error: false,
  discount_reason_missing_equipment: false,
  discount_reason_litigation: false,
  discount_reason_late_customer_order_aborted: false,
  discount_reason_one_out_of_two_trusker_on_order: false,
  discount_reason_return_order: false,
  discount_reason_customer_refund_trusker_aborted_order_last_minu: false,
  discount_reason_small_material_damage: false,
  discount_reason_trusker_missing_2nd_trusker: false,
  discount_reason_trusker_not_decent: false,
  discount_reason_toll: false,
  discount_reason_trusker_aborted_order_last_minute: false,
  discount_reason_customer_refund_trusker_missing_2nd_trusker: false,
  discount_reason_early_trusker: false,
  discount_reason_bad_billing_information: false,
  discount_reason_trusker_did_not_want_to_handle_upstairs: false,
  discount_reason_items_not_protected_by_trusker: false,
  discount_reason_trusker_refused_handling: false,
  discount_reason_mwpp: false,
  discount_reason_other: false,
  price_with_discount: 4972,
  commission_amount: 2188,
  service_provider_amount: 2784,
  service_provider_discount_amount: 0,
  customer_discount_amount: 0,
  trusk_discount_amount: 0,
  customer_name: "Ikea France",
  sales_id: null,
};

let agentExecutor: chainType;
beforeAll(async () => {
  const model = getModel("test-trusk-delivery");
  agentExecutor = await deliveryChain(model);
});

test("Delivery Tool - When", async () => {
  const input = {
    id: "a5CFeW0DmA",
    question: "Quand est prevue ma commande ?",
  };

  const result = await agentExecutor(input);

  console.log(result);
});

test("Delivery Tool - Where", async () => {
  const input = {
    id: "a5CFeW0DmA",
    question: "Ou est ma commande ?",
  };

  const result = await agentExecutor(input);

  console.log(result);
});

test("Delivery Tool - What", async () => {
  const input = {
    id: "a5CFeW0DmA",
    question: "Que se passe t'il avec ma commande ?",
  };

  const result = await agentExecutor(input);

  console.log(result);
});

test.skip("Delivery Tool - Special Case - Curbside", async () => {
  const input = {
    id: "a5CFeW0DmA",
    question: "Le trusker refuse de monter, pourquoi ?",
  };

  const result = await agentExecutor(input);

  console.log(result);
});

test.skip("Delivery Tool - Special Case - Contact Trusker ", async () => {
  const input = {
    id: "a5CFeW0DmA",
    question: "Pouvez vous contacter le chauffeur pour qu'il puisse monter ?",
  };

  const result = await agentExecutor(input);

  console.log(result);
});

test("Delivery Tool - Special Case - How many articles", async () => {
  const input = {
    id: "1342238030",
    question: "Combien y a t'il de colis dans ma commande ?",
  };

  const result = await agentExecutor(input);

  expect(result).toContain("5");
});
