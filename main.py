from flask import Flask, jsonify

import psutil



@app.route('/interfaces', methods=['GET'])
def get_interfaces():
    interfaces = psutil.net_if_addrs()
    return jsonify(interfaces)

if __name__ == '__main__':
    app.run(debug=True)
