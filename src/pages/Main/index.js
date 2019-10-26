import React, { useState, useEffect } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Form, SubmitButton, List } from './styles';
import api from '../../services/api';
import Container from '../../components/Container';

function Main() {
    const initialRepositories = () => {
        const repositories = localStorage.getItem('repositories');
        if (repositories) {
            return JSON.parse(repositories);
        }
        return [];
    };

    const [newRepo, setNewRepo] = useState('');
    const [repos, setRepos] = useState(initialRepositories);
    const [loading, setLoading] = useState(false);

    useEffect(
        () => localStorage.setItem('repositories', JSON.stringify(repos)),
        [repos]
    );

    function handleInputChange(e) {
        setNewRepo(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        const response = await api.get(`/repos/${newRepo}`);

        const data = {
            name: response.data.full_name,
        };

        setRepos([...repos, data]);
        setNewRepo('');
        setLoading(false);
    }

    return (
        <Container>
            <h1>
                <FaGithubAlt />
                Repositórios
            </h1>

            <Form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Adicionar repositório"
                    onChange={handleInputChange}
                    value={newRepo}
                />

                <SubmitButton loading={loading ? 1 : 0}>
                    {loading ? (
                        <FaSpinner color="#fff" size={14} />
                    ) : (
                        <FaPlus color="#fff" size={14} />
                    )}
                </SubmitButton>
            </Form>

            <List>
                {repos.map(item => (
                    <li key={item.name}>
                        <span>{item.name}</span>
                        <Link
                            to={`/repository/${encodeURIComponent(item.name)}`}
                        >
                            Detalhes
                        </Link>
                    </li>
                ))}
            </List>
        </Container>
    );
}

export default Main;
