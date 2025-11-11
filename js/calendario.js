// Importa a conexão (ele vai achar na mesma pasta)
import { _supabase } from './supabaseClient.js';

// Escuta quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializa o Calendário
    const calendarEl = document.getElementById('calendar-container');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Visão de Mês (o "calendário grande")
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek' // Botões para trocar visão
        },
        locale: 'pt-br', // DEIXA EM PORTUGUÊS!
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana'
        },
        
        // A MÁGICA: PUXA OS EVENTOS DO SUPABASE
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                // Busca na tabela 'eventos'
                const { data, error } = await _supabase
                    .from('eventos')
                    .select('titulo, data, local'); // Puxa os dados
                
                if (error) throw error;

                // Formata os dados para o calendário
                const eventosFormatados = data.map(evento => ({
                    title: evento.titulo,
                    start: evento.data  // O FullCalendar entende 'AAAA-MM-DD'
                }));
                
                successCallback(eventosFormatados);

            } catch (error) {
                failureCallback(error);
            }
        },

        // A MÁGICA 2: O QUE VOCÊ PEDIU (Clicar no dia)
        dateClick: function(info) {
            alert('Você clicou no dia: ' + info.dateStr);
            // Aqui podemos adicionar um modal no futuro
        },
        
        // Clicar em um evento que JÁ EXISTE
        eventClick: function(info) {
            alert('Evento: '  + info.event.title);
        }
    });
    
    calendar.render(); // Desenha o calendário na tela
});